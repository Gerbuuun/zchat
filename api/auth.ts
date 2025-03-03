import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { sign } from 'hono/jwt';
import postgres from 'postgres';
import { Resource } from 'sst';
import { ulid } from 'ulid';
import { users } from '../database/schema';

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
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

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
        'User-Agent': 'zchat by gerbuuun',
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
          username: userData.login || user.username,
        })
        .where(eq(users.id, user.id));
    }
    else {
      // Create new user
      const newUser = {
        id: ulid(),
        githubId: userData.id,
        name: userData.name || 'GitHub User',
        username: userData.login || '',
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

export const handler = handle(app);
