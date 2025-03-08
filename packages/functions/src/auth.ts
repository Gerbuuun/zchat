import type { Context } from 'hono';
import { githubAuth } from '@hono/oauth-providers/github';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import { Resource } from 'sst';
import { ulid } from 'ulid';
import { getDB, users } from 'zchat-database';

const app = new Hono()
  .basePath('/api')
  .use('/auth', githubAuth({
    client_id: Resource.GITHUB_CLIENT_ID.value,
    client_secret: Resource.GITHUB_CLIENT_SECRET.value,
    oauthApp: true,
  }));

app.get('/auth', async (c: Context) => {
  const userData = c.get('user-github');

  if (!userData?.id || !userData.login || !userData.name) {
    return c.json({ error: 'Missing user data' }, 401);
  }

  const db = getDB();

  // Try to find the user by GitHub ID
  let [user] = await db.select().from(users).where(eq(users.githubId, userData.id.toString())).limit(1);

  if (user) {
    await db
      .update(users)
      .set({ name: userData.name, username: userData.login })
      .where(eq(users.id, user.id));
  }
  else {
    const newUser = {
      id: ulid(),
      githubId: userData.id.toString(),
      name: userData.name || 'Unknown User',
      username: userData.login || userData.id.toString(),
    };

    await db.insert(users).values(newUser);
    user = newUser;
  }

  // Create JWT token
  const jwt = await sign({
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
  }, process.env.JWT_SECRET);

  // Set the JWT cookie
  setCookie(c, 'auth', jwt, {
    path: '/',
    maxAge: 604800,
    sameSite: 'Lax',
  });

  return c.redirect(`https://${process.env.SPA_DOMAIN}/`);
});

export const handler = handle(app);
