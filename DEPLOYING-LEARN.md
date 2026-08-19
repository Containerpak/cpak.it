# Deploying Learn

Learn works with none of this configured: the site builds, every lesson reads,
every playground runs, and the account keeps its rows in the memory of one
isolate. That is right for `npm run dev` and wrong for anything else, so each
step below turns one part of it real. Each one is independent, and the pages
say which of the two they are running on.

## 1. The database

```sh
wrangler d1 create cpak-learn                      # prints a database id
# paste it into wrangler.toml, then
wrangler d1 migrations apply cpak-learn --remote
```

`wrangler.toml` already carries the binding with an empty `database_id`. It is
empty rather than absent on purpose: an empty id fails the deploy and names
itself, while a missing binding fails nowhere and quietly loses every account.

Without it: accounts, progress and credentials live in one isolate's memory and
are gone on the next cold start. The account page says so in those words.

## 2. Signing in

```sh
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

From a GitHub OAuth app whose callback is
`https://cpak.it/learn/account/auth/github/callback`.

Without them: GitHub sign-in is not offered. A local sign-in stands in, and
only while the dev server is running, so a deployment with no provider has no
way in rather than a weak one.

## 3. Signed credentials

```sh
openssl genpkey -algorithm ed25519 -out learn-signing.pem
openssl pkcs8 -topk8 -nocrypt -in learn-signing.pem -outform DER | base64 -w0
#   put that in: wrangler secret put LEARN_SIGNING_KEY
openssl pkey -in learn-signing.pem -pubout -outform DER | tail -c 32 | base64 -w0
#   put that in: wrangler secret put LEARN_SIGNING_PUBLIC
rm learn-signing.pem
```

The public half is given separately because the private key is imported
non-extractable, and a signing key that can be exported is a signing key that
can leave.

Without them: credentials are issued with a code and no signature. They still
verify at `/verify`, which is how most people check one. What is missing is the
offline check.

With them, two endpoints start answering:

- `/.well-known/jwks.json`, the public key, named by its RFC 8037 thumbprint.
  Serves `{"keys": []}` when nothing is configured, which is the honest answer
  in the shape a verifier already understands.
- `/verify/status-list`, a W3C Bitstring Status List saying which credentials
  no longer stand. Fetching the whole list is how somebody checks one
  credential without telling cpak.it which one they are asking about.

Rotating the key: put the new one in, and leave the old public key in the key
set until the last credential signed with it has expired. Every token names the
key that signed it, so both check.

## 4. Deploy

```sh
npm run build && wrangler pages deploy
```

## What is checked where

| Thing | Endpoint | With nothing configured |
| --- | --- | --- |
| A credential by its code | `/verify/CODE` | works |
| The signing keys | `/.well-known/jwks.json` | `{"keys":[]}` |
| Whether a credential still stands | `/verify/status-list` | an empty list |
| Accounts and progress | `/learn/account` | kept in memory, says so |
