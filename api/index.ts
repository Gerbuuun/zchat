import type { Context } from 'hono';
import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { sign, verify } from 'hono/jwt';
import postgres from 'postgres';
import { Resource } from 'sst';
import { ulid } from 'ulid';
import { chatAccess, chats, messageChunks, messages, users } from '../database/schema';
import { generateTitle, streamChunkedParagraphs } from './openai';

function getDB() {
  const client = postgres(`postgres://${Resource.Database.username}:${Resource.Database.password}@${Resource.Database.host}:${Resource.Database.port}/${Resource.Database.database}`);
  return drizzle(client);
}

export type Drizzle = ReturnType<typeof getDB>;

const app = new Hono().basePath('/api');

const clientId = Resource.GITHUB_CLIENT_ID.value;
const clientSecret = Resource.GITHUB_CLIENT_SECRET.value;

app.get('/auth', async () => {
  const redirectUri = `https://${process.env.SPA_DOMAIN}/api/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: githubAuthUrl,
    },
  });
});

app.get('/callback', async (c: Context) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response(JSON.stringify({ error: 'No code provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `https://${process.env.SPA_DOMAIN}/api/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(JSON.stringify({ error: tokenData.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user data with the access token
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
        'User-Agent': 'zchat',
      },
    });

    const userData = await userResponse.json();
    const db = getDB();

    // Try to find the user by GitHub ID
    let [user] = await db.select().from(users).where(eq(users.githubId, userData.id)).limit(1);

    if (user) {
      await db.update(users)
        .set({
          name: userData.name || user.name,
          email: userData.email || user.email,
          avatarUrl: userData.avatar_url || user.avatarUrl,
        })
        .where(eq(users.id, user.id));
    }
    else {
      // Create new user
      const newUser = {
        id: ulid(),
        githubId: userData.id,
        name: userData.name || 'GitHub User',
        email: userData.email || '',
        avatarUrl: userData.avatar_url || '',
      };

      await db.insert(users).values(newUser);
      user = newUser;
    }

    // Create JWT token
    const jwt = await sign({
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
    }, Resource.JWT_SECRET.value);

    // Redirect to home with JWT cookie
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `https://${process.env.SPA_DOMAIN}/`,
        'Set-Cookie': `auth=${jwt}; Path=/; Max-Age=604800; SameSite=Lax`, // 7 days
      },
    });
  }
  catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

app.get('/chat/:id', async (c: Context) => {
  const id = c.req.param('id');
  const jwt = c.req.header('Cookie')?.split('; ').find(row => row.startsWith('auth='))?.split('=')[1];

  // Anonymous users can never send messages
  if (!jwt) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const payload = await verify(jwt, Resource.JWT_SECRET.value);
  if (!payload) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = getDB();

  // Check if the chat exists and the user has write access to it
  const [chat] = await db
    .select({
      id: chats.id,
      title: chats.title,
      userId: chats.userId,
      access: sql<string[]>`coalesce(array_agg(${chatAccess.userId}) filter (where ${chatAccess.userId} is not null), '{}')`.as('access'),
    })
    .from(chats)
    .where(eq(chats.id, id))
    .leftJoin(chatAccess, and(eq(chatAccess.chatId, chats.id), eq(chatAccess.write, true)))
    .groupBy(chats.id);

  if (!chat || (chat.userId !== payload.sub && !chat.access.includes(payload.sub as string))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get all previous messages for context
    const chatMessages = await db
      .select({
        id: messages.id,
        role: messages.role,
        content: sql<string>`string_agg(${messageChunks.content}, '')`.as('content'),
      })
      .from(messages)
      .where(eq(messages.chatId, id))
      .innerJoin(messageChunks, eq(messages.id, messageChunks.messageId))
      .groupBy(messages.id);

    // Create AI message in database first
    // TODO: Also do this on the client side for even more local first feel
    const assistantMessageId = ulid();
    await db.insert(messages).values({
      id: assistantMessageId,
      chatId: id,
      role: 'assistant',
      createdAt: new Date(),
    });

    // Stream paragraphs into database
    await streamChunkedParagraphs(assistantMessageId, chatMessages, db);

    // Generate title
    if (chat.title === 'New Chat') {
      const title = await generateTitle(chatMessages[0]);
      await db.update(chats).set({ title }).where(eq(chats.id, id));
    }
    return c.json({ success: true });
  }
  catch (error) {
    console.error('Error generating AI response:', error);
    return c.json({ error: 'Failed to process request' }, 500);
  }
  finally {
    // Unlock the chat
    await db.update(chats).set({ locked: false }).where(eq(chats.id, id));
  }
});

export const handler = handle(app);
