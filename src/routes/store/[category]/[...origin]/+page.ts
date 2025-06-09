import type { PageLoad } from './$types';

const RAW_STORE_INDEX =
    'https://raw.githubusercontent.com/Containerpak/store/main/index.json';

interface CpakSpec {
    version: string;
    description?: string;
    image: string;
    binaries: string[];
    desktop_entries: string[];
    dependencies: string[];
    addons: string[];
    override: Record<string, boolean>;
}

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
    const entry = categoryMap[params.origin];
    if (!entry) throw new Error(`Unknown package ${params.origin}`);

    const mfRes = await fetch(entry.manifest);
    if (!mfRes.ok) throw new Error('Cannot fetch manifest');
    const manifest = (await mfRes.json()) as {
        branch?: string;
        commit?: string;
        release?: string;
        description?: string;
    };

    const ref = manifest.branch ?? manifest.commit ?? manifest.release;
    if (!ref) throw new Error('No ref in manifest');

    const { owner, repo } = parseOrigin(params.origin);
    const upstreamBase = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}`;
    const cpakUrl = `${upstreamBase}/cpak.json`;
    const cpakRes = await fetch(cpakUrl);
    if (!cpakRes.ok) throw new Error(`Missing cpak.json`);
    const cpak = (await cpakRes.json()) as CpakSpec;

    const storeBase = entry.manifest.replace(/\/[^/]+$/, '');
    const icon = `${storeBase}/icon.svg`;

    const screenshots: string[] = [];
    for (let i = 1; i <= 10; i++) {
        const url = `${storeBase}/screenshot-${i}.webp`;
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) screenshots.push(url);
        else break;
    }

    const showUrl = `${storeBase}/showcase.webm`;
    const showRes = await fetch(showUrl, { method: 'HEAD' });
    const showcase = showRes.ok ? showUrl : null;

    const description =
        manifest.description?.trim() ||
        entry.description?.trim() ||
        cpak.description?.trim() ||
        '';

    return {
        pkg: {
            origin: params.origin,
            name: entry.name,
            description,
            version: cpak.version,
            manifest: entry.manifest,
            cpak,
            icon,
            screenshots,
            showcase,
            rawCpakJson: cpakUrl
        }
    };
};
