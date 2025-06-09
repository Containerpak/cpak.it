import type { PageLoad } from './$types';

const CHRONOS_BASE = 'https://chronos.vanillaos.org/vos-docs';
const LANG = 'en';

export const load: PageLoad = async ({ fetch, params }) => {
    const res = await fetch(`${CHRONOS_BASE}/articles/${LANG}/${params.slug}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch article ${params.slug}`);
    }
    const art = await res.json() as {
        Title: string;
        Description: string;
        Body: string;
        PublicationDate: string;
        Authors: string[];
        Tags: string[];
        Previous: string;
        Next: string;
    };
    return { art };
};
