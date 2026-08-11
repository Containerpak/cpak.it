import { articles } from "$lib/docs";
import { json } from "@sveltejs/kit";

export const GET = () =>
  json(
    articles.map((article) => ({
      title: article.title,
      url: `/docs/${article.slug}`,
      description: article.description,
      searchText:
        `${article.title} ${article.description} ${article.tags.join(" ")}`.toLowerCase(),
    })),
    {
      headers: {
        "cache-control": "public, max-age=300",
      },
    },
  );
