import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { publicKeys } from "$lib/server/learn/signing";

export const GET: RequestHandler = async ({ setHeaders }) => {
  setHeaders({ "cache-control": "public, max-age=3600" });
  return json({ keys: await publicKeys() });
};

export const prerender = false;
