import type { LayoutServerLoad } from "./$types";
import { whoIsHere } from "$lib/server/learn/session";

// Who is signed in, for the whole of Learn.
//
// The topbar carries it, so it has to be answered on every page under /learn
// rather than only on the account page. Nothing outside Learn asks: the rest of
// the site has no account and its header shows none.
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
