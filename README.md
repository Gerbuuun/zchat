# ZChat

Proof of concept for an LLM-powered chat application built with Zero as requested by [Aaron Boodman](https://github.com/aboodman) on [this twitter thread](https://x.com/aboodman/status/1894758922155888650).

The goal of this project is to show how Zero can be used to stream LLM responses to the client. Other requirements mentioned are:
> - svelte
> - spa-only, no ssr (it would be cool to ssr the read-only snapshot, but a different project)
> - chat are saved in sidebar and switch instantly between them
> - LIKE-based text filter over prev chats
> - deploy w/ sst
> - I don't care if you can choose models, just pick one. The point is not to demonstrate AI.
> - Integration with AI should be at server-level. Responses should be accumulated into chunks (roughly paras) and saved into db at that granularity on the server. Use zero's sync for streaming to UI.
> - Support ✨sharing✨ a chat in either r/o or r/w mode

### It is built with:
- [Zero](https://zero-sync.dev) for the sync engine
- [Svelte](https://svelte.dev/) (SvelteKit with static adapter) for the frontend
- [Hono](https://hono.dev/) for the Github OAuth flow
- [SST](https://sst.dev/) for deployment to AWS
- [OpenAI](https://openai.com) SDK for generating the LLM responses
- Of course some other things I'd call standard:
  - [TailwindCSS](https://tailwindcss.com/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
  - [Drizzle ORM](https://drizzle.dev/)

### Project structure:
This monorepo is based on the [SST monorepo template](https://github.com/sst/sst/tree/dev/examples/aws-monorepo).
- `infra` - SST & Pulumi Resources (infrastructure as code)
- `packages/web` - Svelte frontend
- `packages/functions` - Lambda functions
- `packages/database` - Database schema and migrations

### Infrastructure:
- S3 for static assets
- CloudFront for CDN
- RDS Postgres for the database
- Lambda for the hono server and generating the LLM responses
- ECS for the Zero sync engine
- Amazon VPC for communication between the services
- Cloudflare for DNS and Proxy

The `infra` directory contains the SST & Pulumi resources which describe the infrastructure.

### How does it work?
1. The Svelte frontend is a single-page application that uses a Zero sync client to insert new data.
2. The Zero sync client is connected to the Zero sync cache running in AWS ECS.
3. The Zero sync cache replicates an RDS Postgres database.
4. On user message insert, the RDS database triggers a Lambda function to generate a response from the LLM.
5. The LLM response is accumulated into chunks and saved into the RDS database.
6. The Zero cache syncs the changes to all the clients.
7. The frontend displays the message and the LLM response.

## Deployment:
First things first, install the dependencies:
```bash
pnpm install
```

Follow the instructions in the [SST docs](https://sst.dev/docs/aws-accounts) to set up your AWS account and permissions and then login to AWS with the CLI:
```bash
pnpm sso --sso-session={your-sso-session}
```
> [!NOTE]
> I use Cloudflare for DNS and Proxy. If you also do that, you need to set the Cloudflare environment variables:
> ```env
> CLOUDFLARE_ZONE_ID={your-cloudflare-zone-id}
> CLOUDFLARE_API_TOKEN={your-cloudflare-api-token}
> CLOUDFLARE_ACCOUNT_ID={your-cloudflare-account-id}
> ```
> In `infra/constants.ts` you can set the domains you want to use.  
> The domains can be removed from the resources if you don't want to use them. (`infra/web` and `infra/zero`)

> [!IMPORTANT]
> You can't proxy websockets through Cloudflare, so for the Zero instance the proxy is disabled.

Now you can deploy the infrastructure with a single `sst deploy`. (Note: You need to be root to deploy to production because of the tunnel that needs to be registered.)
```bash
sudo sst deploy --stage production
```
