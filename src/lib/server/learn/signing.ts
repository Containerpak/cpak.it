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
    return null;
  }
}

function publicBytes(): Uint8Array | null {
  const held = env.LEARN_SIGNING_PUBLIC ?? "";
  if (!held) return null;
  try {
    const bytes = fromBase64(held.trim());
    return bytes.length === 32 ? bytes : null;
  } catch {
    return null;
  }
}

async function publicKey(): Promise<CryptoKey | null> {
  const bytes = publicBytes();
  if (!bytes) return null;
  try {
    return await crypto.subtle.importKey(
      "raw",
      bytes.buffer as ArrayBuffer,
      ALGORITHM,
      false,
      ["verify"],
    );
  } catch {
    return null;
  }
}

export async function keyId(): Promise<string | null> {
  const bytes = publicBytes();
  if (!bytes) return null;
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

export async function signCredential(claims: Claims): Promise<string> {
  const key = await privateKey();
  const verifier = await publicKey();
  const kid = await keyId();
  if (!key || !verifier || !kid) return "";

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
  const signature = new Uint8Array(await crypto.subtle.sign(
    ALGORITHM,
    key,
    new TextEncoder().encode(signed),
  ));
  const valid = await crypto.subtle.verify(
    ALGORITHM,
    verifier,
    signature,
    new TextEncoder().encode(signed),
  );
  return valid ? `${signed}.${base64url(signature)}` : "";
}

export async function encodedStatusList(revoked: number[]): Promise<string> {
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
