import type { PageLoad } from './$types';

const RAW_STORE_INDEX = 'https://raw.githubusercontent.com/Containerpak/store/main/index.json';
const RAW_CATEGORIES_META =
    'https://raw.githubusercontent.com/Containerpak/store/main/categories.json';

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    'AI-ML': 'Local assistants, model tools and AI workspaces.',
    Database: 'Database clients, query tools and data explorers.',
    'Desktop Environments': 'Complete desktop sessions installed and managed as cpak packages.',
    Development: 'Editors, IDEs, SDKs and tools for building software.',
    DevOps: 'Infrastructure and operations tools for local and remote systems.',
    Games: 'Games, launchers, emulators and gaming utilities.',
    Graphics: 'Creative tools for images, 3D work and digital production.',
    Multimedia: 'Audio, video, recording and media playback.',
    Networking: 'Communication, remote access, syncing and network tools.',
    Productivity: 'Writing, notes, office work and everyday organization.',
    Security: 'Password managers and tools that protect your data.',
    System: 'Hardware, virtualization and desktop system utilities.',
    Utilities: 'Useful tools that do one job well.',
    Web: 'Browsers and applications built around the web.',
};

export const load: PageLoad = async ({ fetch }) => {
    const [idxRes, catRes] = await Promise.all([
        fetch(RAW_STORE_INDEX),
        fetch(RAW_CATEGORIES_META),
    ]);
    if (!idxRes.ok) throw new Error('Cannot load store index');
    if (!catRes.ok) throw new Error('Cannot load categories metadata');

    const storeIndex = (await idxRes.json()) as Record<string, Record<string, any>>;
    const categoriesMeta = (await catRes.json()) as Record<string, { icon: string; color: string }>;

    const temp = Object.entries(categoriesMeta).map(([name, meta]) => {
        const entries = storeIndex[name] || {};
        const origins = Object.keys(entries);
        const count = origins.length;
        const appIcons = origins.slice(0, 8).map((origin) => {
            const manifest = (entries[origin] as any).manifest as string;
            return `${manifest.replace(/\/[^/]+$/, '')}/icon.svg`;
        });
        return {
            name,
            icon: meta.icon,
            color: meta.color,
            count,
            appIcons,
            description: CATEGORY_DESCRIPTIONS[name] || 'Browse packages in this category.',
        };
    });

    temp.sort((a, b) => b.count - a.count);

    const categories = temp.map((category, index) => ({
        ...category,
        featured: index === 0,
    }));

    return { categories };
};
