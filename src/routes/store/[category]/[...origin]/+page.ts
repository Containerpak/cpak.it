import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { packageUrl } from "$lib/store";

export const load: PageLoad = ({ params }) => {
  redirect(301, packageUrl(params.origin));
};
