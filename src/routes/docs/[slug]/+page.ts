import { error, redirect } from "@sveltejs/kit";
import {
  getArticle,
  getArticleNeighbors,
  getGroupedArticles,
} from "$lib/docs";
import { getLocale } from "$lib/paraglide/runtime.js";

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

  const locale = getLocale();
  const article = getArticle(params.slug, locale);
  if (!article) throw error(404, "Article not found");
  return {
    article,
    groups: getGroupedArticles(locale),
    ...getArticleNeighbors(article.slug, locale),
  };
};
