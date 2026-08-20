import { getGroupedArticles, getLocalizedArticles } from "$lib/docs";
import { getLocale } from "$lib/paraglide/runtime.js";

export const load = () => {
  const locale = getLocale();
  return {
    articles: getLocalizedArticles(locale),
    groups: getGroupedArticles(locale),
  };
};
