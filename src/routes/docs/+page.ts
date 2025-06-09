import type { PageLoad } from './$types';

const CHRONOS_BASE = 'https://chronos.vanillaos.org/vos-docs';
const LANG = 'en';

export const load: PageLoad = async ({ fetch }) => {
    const res = await fetch(`${CHRONOS_BASE}/articles/${LANG}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch docs index (${res.status})`);
    }
    const data = await res.json() as {
        title: string;
        SupportedLang: string[];
        tags: string[];
        articles: {
            Slug: string;
            Title: string;
            Description: string;
            PublicationDate: string;
            Authors: string[];
            Tags: string[];
        }[];
    };

    const articles = data.articles
        .filter(a => (a as any).Listed)
        .sort((a, b) => Date.parse(b.PublicationDate) - Date.parse(a.PublicationDate));

    return { articles };
};
