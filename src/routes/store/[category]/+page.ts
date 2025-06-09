import type { PageLoad } from './$types';

const RAW_STORE_INDEX =
    'https://raw.githubusercontent.com/Containerpak/store/main/index.json';

function parseOrigin(origin: string): { owner: string; repo: string } {
    const [, owner, repo] = origin.split('/');
    return { owner, repo };
}

export const load: PageLoad = async ({ fetch, params }) => {
    const idxRes = await fetch(RAW_STORE_INDEX);
    if (!idxRes.ok) throw new Error('Cannot load store index');
    const storeIndex = (await idxRes.json()) as Record<
        string,
        Record<
            string,
            {
                name: string;
                description?: string;
                branch?: string;
                commit?: string;
                release?: string;
                manifest: string;
            }
        >
    >;

    const categoryMap = storeIndex[params.category];
    if (!categoryMap) throw new Error(`Unknown category ${params.category}`);

    const packages = await Promise.all(
        Object.entries(categoryMap).map(async ([origin, entry]) => {
            const mfRes = await fetch(entry.manifest);
            if (!mfRes.ok) throw new Error(`Cannot fetch manifest for ${origin}`);
            const manifest = (await mfRes.json()) as {
                branch?: string;
                commit?: string;
                release?: string;
                description?: string;
            };

            const ref = manifest.branch ?? manifest.commit ?? manifest.release;
            if (!ref) throw new Error(`No ref in manifest for ${origin}`);

            const { owner, repo } = parseOrigin(origin);
            const upstreamBase = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}`;
            const cpakUrl = `${upstreamBase}/cpak.json`;
            const cpakRes = await fetch(cpakUrl);
            if (!cpakRes.ok) throw new Error(`Missing cpak.json for ${origin}`);
            const cpak = (await cpakRes.json()) as {
                version: string;
                description?: string;
            };

            const storeBase = entry.manifest.replace(/\/[^/]+$/, '');
            const icon = `${storeBase}/icon.svg`;

            const description =
                manifest.description?.trim()
                || entry.description?.trim()
                || cpak.description?.trim()
                || '';

            return {
                origin,
                name: entry.name,
                description,
                version: cpak.version,
                icon
            };
        })
    );

    return {
        category: params.category,
        packages
    };
};
