# Deploying Learn

Learn needs a D1 database for accounts, progress and credentials. GitHub OAuth
provides sign-in, while an Ed25519 key enables signed credentials. Lessons and
browser workspaces remain available when these services are not configured.

## Database

Create the database, add its identifier to `wrangler.toml`, then apply the
migrations:

```sh
wrangler d1 create cpak-learn
wrangler d1 migrations apply cpak-learn --remote
```

The `LEARN_DB` binding must exist in production. Without it, the development
server uses an in-memory store that is cleared when the process stops.

## GitHub sign-in

Create a GitHub OAuth application with this callback URL:

```text
https://cpak.it/learn/account/auth/github/callback
```

Store its credentials as Worker secrets:

```sh
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

Local sign-in is offered only by the development server when GitHub OAuth is
not configured.

## Credential signing

Generate an Ed25519 key pair:

```sh
openssl genpkey -algorithm ed25519 -out learn-signing.pem
openssl pkcs8 -topk8 -nocrypt -in learn-signing.pem -outform DER | base64 -w0
openssl pkey -in learn-signing.pem -pubout -outform DER | tail -c 32 | base64 -w0
```

Store the first output in `LEARN_SIGNING_KEY` and the second in
`LEARN_SIGNING_PUBLIC`:

```sh
wrangler secret put LEARN_SIGNING_KEY
wrangler secret put LEARN_SIGNING_PUBLIC
rm learn-signing.pem
```

Signed credentials use these endpoints:

- `/.well-known/jwks.json` publishes the verification key.
- `/verify/status-list` publishes the credential revocation list.
- `/verify/<code>/token` returns the signed token for one credential.

Keep the old public key available until every credential signed by it has
expired when rotating the key.

## Deploy

```sh
pnpm build
wrangler pages deploy
```
