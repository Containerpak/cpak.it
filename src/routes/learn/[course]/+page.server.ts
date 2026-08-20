import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { findCourse } from "$lib/server/learn/catalog";
import { getLocale } from "$lib/paraglide/runtime.js";

export const load: PageServerLoad = async ({ params }) => {
  const entry = findCourse(params.course, getLocale());
  if (!entry) error(404, "There is no course by that name.");
  return entry;
};
