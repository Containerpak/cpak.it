import type { LayoutServerLoad } from "./$types";
import { PLAYGROUNDS } from "$lib/learn/playgrounds";
import { getLocale } from "$lib/paraglide/runtime.js";
import { localizeLearn } from "$lib/server/learn/localize";

export const load: LayoutServerLoad = async () => ({
  playgrounds: localizeLearn(PLAYGROUNDS, getLocale()),
});
