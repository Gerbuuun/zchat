export const jwtSecret = new random.RandomPassword('JWT_SECRET', {
  length: 32,
  special: true,
});
export const githubClientID = new sst.Secret('GITHUB_CLIENT_ID');
export const githubClientSecret = new sst.Secret('GITHUB_CLIENT_SECRET');
