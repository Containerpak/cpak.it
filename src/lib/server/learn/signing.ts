// A credential that can be checked without asking cpak.it.
//
// The code on a credential is enough to look it up here, and for most people
// that is the whole story. It is not enough for somebody who wants to check a
// credential offline, keep a copy of the proof, or satisfy themselves that
// cpak.it did not simply make the answer up on the day they asked. For them
// every credential is also issued as a signed token: the same facts, signed
// with a key whose public half is published, naming a position in a status
// list that says whether the credential still stands.
//
// Without a key configured, credentials are issued unsigned. That is the same
// rule the sign-in provider follows: the feature that cannot be configured is
// absent and says so, rather than pretending with something weaker.

import { env } from "$env/dynamic/private";

const ALGORITHM = { name: "Ed25519" } as const;

export const ISSUER = "https://cpak.it";
export const STATUS_LIST = `${ISSUER}/verify/status-list`;

function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encode(value: unknown) {
  return base64url(new TextEncoder().encode(JSON.stringify(value)));
}

/**
 * The private key, as a base64 PKCS#8 Ed25519 key in LEARN_SIGNING_KEY.
 *
 * Generated with:
 *   openssl genpkey -algorithm ed25519 | openssl pkcs8 -topk8 -nocrypt -outform DER | base64 -w0
 */
async function privateKey(): Promise<CryptoKey | null> {
  const held = env.LEARN_SIGNING_KEY ?? "";
  if (!held) return null;
  try {
    return await crypto.subtle.importKey(
      "pkcs8",
      fromBase64(held.trim()).buffer as ArrayBuffer,
      ALGORITHM,
      false,
      ["sign"],
    );
  } catch {
    // A key that will not import is a deployment mistake, not a request that
    // should fail: credentials go out unsigned and the account page says so.
    return null;
  }
}

/**
 * The public half, as a base64 raw Ed25519 public key in LEARN_SIGNING_PUBLIC.
 *
 * It is a separate variable rather than derived from the private key because
 * Web Crypto cannot export the public half of a non-extractable private key,
 * and a signing key that can be exported is a signing key that can leave.
 *
 *   openssl pkey -pubout -outform DER | tail -c 32 | base64 -w0
 */
function publicBytes(): Uint8Array | null {
  const held = env.LEARN_SIGNING_PUBLIC ?? "";
  if (!held) return null;
  const bytes = fromBase64(held.trim());
  return bytes.length === 32 ? bytes : null;
}

/** Names which key signed a token, so an old one can still be checked. */
export async function keyId(): Promise<string | null> {
  const bytes = publicBytes();
  if (!bytes) return null;
  // The RFC 8037 thumbprint: the JWK's required members, in lexicographic
  // order, hashed. Anybody holding the public key derives the same name.
  const thumbprint = JSON.stringify({
    crv: "Ed25519",
    kty: "OKP",
    x: base64url(bytes),
  });
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(thumbprint),
  );
  return base64url(new Uint8Array(digest));
}

export type PublicKey = {
  kty: "OKP";
  crv: "Ed25519";
  x: string;
  kid: string;
  use: "sig";
  alg: "EdDSA";
};

/** The key set, empty when this deployment signs nothing. */
export async function publicKeys(): Promise<PublicKey[]> {
  const bytes = publicBytes();
  const kid = await keyId();
  if (!bytes || !kid) return [];
  return [
    { kty: "OKP", crv: "Ed25519", x: base64url(bytes), kid, use: "sig", alg: "EdDSA" },
  ];
}

export function signingConfigured() {
  return Boolean(env.LEARN_SIGNING_KEY && publicBytes());
}

export type Claims = {
  code: string;
  provider: string;
  handle: string;
  exam: string;
  title: string;
  result: string;
  issuedAt: string;
  expiresAt: string;
  statusIndex: number;
};

/**
 * The signed form of one credential, or an empty string when this deployment
 * has no key. The claims are the ones the verification page shows, so a reader
 * comparing the two never finds a difference.
 */
export async function signCredential(claims: Claims): Promise<string> {
  const key = await privateKey();
  const kid = await keyId();
  if (!key || !kid) return "";

  const header = { alg: "EdDSA", typ: "JWT", kid };
  const payload = {
    iss: ISSUER,
    sub: `${claims.provider}:${claims.handle}`,
    jti: claims.code,
    iat: Math.floor(Date.parse(claims.issuedAt) / 1000),
    exp: Math.floor(Date.parse(claims.expiresAt) / 1000),
    cpak: { exam: claims.exam, title: claims.title, result: claims.result },
    status: { list: STATUS_LIST, index: claims.statusIndex },
  };

  const signed = `${encode(header)}.${encode(payload)}`;
  const signature = await crypto.subtle.sign(
    ALGORITHM,
    key,
    new TextEncoder().encode(signed),
  );
  return `${signed}.${base64url(new Uint8Array(signature))}`;
}

/**
 * The published status list: one bit per credential ever issued, set when that
 * credential no longer stands.
 *
 * The encoding is the one the W3C Bitstring Status List describes, so a reader
 * already holding a verifier does not need to be told anything about cpak: the
 * bitstring is gzipped and base64url encoded, and bit 0 is the first credential
 * issued. A list nobody has revoked from is all zeroes, which is what a
 * deployment that has issued nothing serves.
 */
export async function encodedStatusList(revoked: number[]): Promise<string> {
  // The minimum the specification allows, so the answer does not leak how many
  // credentials exist: 16kB of bits, and it grows only when it has to.
  const MINIMUM = 16 * 1024;
  const highest = revoked.length > 0 ? Math.max(...revoked) : 0;
  const bytes = new Uint8Array(Math.max(MINIMUM, Math.ceil((highest + 1) / 8)));
  for (const index of revoked) {
    if (index < 0) continue;
    bytes[index >> 3] |= 0b1000_0000 >> index % 8;
  }

  const gzipped = new Response(
    new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream("gzip")),
  );
  return base64url(new Uint8Array(await gzipped.arrayBuffer()));
}
