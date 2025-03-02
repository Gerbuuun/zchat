import { PUBLIC_SERVER } from '$env/static/public';
import { schema } from '$lib/zero/schema';
import { Z } from 'zero-svelte';

let userID = 'anon';
const token = document.cookie.split(';').find(c => c.trim().startsWith('auth='))?.split('=')[1];

if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userID = payload.sub;
  }
  catch (e) {
    console.error('Failed to decode JWT token:', e);
  }
}

export const z = new Z({
  userID,
  auth: () => token,
  server: PUBLIC_SERVER,
  schema,
  kvStore: 'mem',
});
