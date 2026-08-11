import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const RELEASE_BASE = 'https://github.com/Containerpak/cpak/releases/download';
const CAPSULE_MAGIC = new TextEncoder().encode('CPAKAPP1');
const MAX_INSTALLER_SIZE = 128 * 1024 * 1024;

interface SignedEntry {
    metadata: string;
    signature: string;
}

interface InstallerCatalog {
    schema: number;
    release: string;
    packages: Record<string, Record<string, SignedEntry>>;
}

interface InstallerMetadata {
    origin: string;
    name: string;
    arch: string;
    installer_sha256: string;
}

export const prerender = false;

export const GET: RequestHandler = async ({ fetch, params, url }) => {
    const origin = params.origin.toLowerCase();
    if (!/^github\.com\/[a-z0-9_.-]+\/[a-z0-9_.-]+$/.test(origin)) {
        return new Response('Invalid package origin', { status: 400 });
    }
    const arch = url.searchParams.get('arch') ?? 'amd64';
    if (arch !== 'amd64' && arch !== 'arm64') {
        return new Response('Unsupported architecture', { status: 400 });
    }

    const release = env.CPAK_INSTALLER_RELEASE || 'v2.0.0-rc.2';
    const installerBase = env.CPAK_INSTALLER_BASE_URL || `${RELEASE_BASE}/${release}`;
    const [catalogResponse, installerResponse] = await Promise.all([
        fetch(`${installerBase}/cpak-installer-catalog.json`),
        fetch(`${installerBase}/cpak-installer-linux-${arch}`)
    ]);
    if (!catalogResponse.ok || !installerResponse.ok) {
        return new Response('Installer release is not available', { status: 503 });
    }

    const catalog = (await catalogResponse.json()) as InstallerCatalog;
    if (catalog.schema !== 1 || catalog.release !== release) {
        return new Response('Installer catalog does not match the selected release', {
            status: 502
        });
    }
    const signed = catalog.packages[origin]?.[arch];
    if (!signed) {
        return new Response('Package is not listed in this installer release', {
            status: 404
        });
    }
    let metadata: Uint8Array;
    let signature: Uint8Array;
    try {
        metadata = decodeBase64(signed.metadata);
        signature = decodeBase64(signed.signature);
    } catch {
        return new Response('Installer signature is invalid', { status: 502 });
    }
    if (signature.length !== 64) {
        return new Response('Installer signature is invalid', { status: 502 });
    }
    let details: InstallerMetadata;
    try {
        details = JSON.parse(new TextDecoder().decode(metadata)) as InstallerMetadata;
    } catch {
        return new Response('Installer metadata is invalid', { status: 502 });
    }
    if (details.origin !== origin || details.arch !== arch || !details.name) {
        return new Response('Installer metadata does not match the request', {
            status: 502
        });
    }

    const installer = new Uint8Array(await installerResponse.arrayBuffer());
    if (installer.length > MAX_INSTALLER_SIZE) {
        return new Response('Installer release is too large', { status: 502 });
    }
    const installerDigest = toHex(await crypto.subtle.digest('SHA-256', installer));
    if (details.installer_sha256 !== installerDigest) {
        return new Response('Installer release does not match its signed metadata', {
            status: 502
        });
    }
    const footer = new Uint8Array(16);
    footer.set(CAPSULE_MAGIC, 0);
    new DataView(footer.buffer).setBigUint64(8, BigInt(metadata.length), true);
    const capsule = concat(installer, metadata, signature, footer);
    const filename = `${details.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'application'}-${arch}.cpak-installer`;

    return new Response(capsule, {
        headers: {
            'Cache-Control': 'public, max-age=300',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': 'application/vnd.cpak.installer',
            'X-Content-Type-Options': 'nosniff'
        }
    });
};

function decodeBase64(value: string) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function concat(...parts: Uint8Array[]) {
    const output = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
    let offset = 0;
    for (const part of parts) {
        output.set(part, offset);
        offset += part.length;
    }
    return output;
}

function toHex(value: ArrayBuffer) {
    return Array.from(new Uint8Array(value), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
