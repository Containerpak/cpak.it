import type { LayoutServerLoad } from "./$types";
import { whoIsHere } from "$lib/server/learn/session";

export const load: LayoutServerLoad = async (event) => {
  const { account } = await whoIsHere(event);
  if (!account) return { account: null };
  return {
    account: {
      handle: account.handle,
      avatar: account.avatar,
      provider: account.provider,
    },
  };
};
