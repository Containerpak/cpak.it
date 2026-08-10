import { error } from '@sveltejs/kit';
import { getArticle } from '$lib/docs';

export const load = ({ params }) => {
	const article = getArticle(params.slug);
	if (!article) throw error(404, 'Article not found');
	return { article };
};
