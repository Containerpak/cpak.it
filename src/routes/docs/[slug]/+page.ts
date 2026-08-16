import { error, redirect } from "@sveltejs/kit";
import { getArticle, getArticleNeighbors } from "$lib/docs";

export const load = ({ params }) => {
  if (params.slug === "packaging") redirect(301, "/docs/first-package");

  const retired = new Set([
    "abroot",
    "abroot-manpage",
    "abroot-porting",
    "almost",
    "apx",
    "apx-manpage",
    "ikaros-manpage",
    "vso-manpage",
  ]);
  if (retired.has(params.slug))
    error(410, "This documentation belongs to a retired project");

  const article = getArticle(params.slug);
  if (!article) throw error(404, "Article not found");
  return { article, ...getArticleNeighbors(article.slug) };
};
