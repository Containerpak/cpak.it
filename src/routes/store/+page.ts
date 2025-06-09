import type { PageLoad } from './$types';

const RAW_STORE_INDEX = 'https://raw.githubusercontent.com/Containerpak/store/main/index.json';
const RAW_CATEGORIES_META = 'https://raw.githubusercontent.com/Containerpak/store/main/categories.json';

const BASE_PATTERN: [number, number][] = [
    [2, 2],
    [2, 1],
    [1, 2],
    [1, 1]
];

export const load: PageLoad = async ({ fetch }) => {
    const [idxRes, catRes] = await Promise.all([
        fetch(RAW_STORE_INDEX),
        fetch(RAW_CATEGORIES_META)
    ]);
    if (!idxRes.ok) throw new Error('Cannot load store index');
    if (!catRes.ok) throw new Error('Cannot load categories metadata');

    const storeIndex = await idxRes.json() as Record<string, Record<string, any>>;
    const categoriesMeta = await catRes.json() as Record<string, { icon: string; color: string }>;

    const temp = Object.entries(categoriesMeta).map(([name, meta]) => {
        const entries = storeIndex[name] || {};
        const origins = Object.keys(entries);
        const count = origins.length;
        const appIcons = origins.slice(0, 3).map(origin => {
            const manifest = (entries[origin] as any).manifest as string;
            return `${manifest.replace(/\/[^/]+$/, '')}/icon.svg`;
        });
        return { name, icon: meta.icon, color: meta.color, count, appIcons };
    });

    temp.sort((a, b) => b.count - a.count);

    const categories = temp.map((cat, i) => {
        const [c, r] = BASE_PATTERN[i % BASE_PATTERN.length];
        return {
            ...cat,
            layoutClass: `col-span-${c} row-span-${r}`
        };
    });

    return { categories };
};
