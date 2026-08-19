import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { openStore } from "$lib/server/learn/store";
import { ISSUER, STATUS_LIST, encodedStatusList } from "$lib/server/learn/signing";

// Which credentials no longer stand.
//
// A signed credential names a position in this list, so somebody holding one
// can find out whether it was superseded without telling cpak.it which
// credential they are asking about: they fetch the whole list and read one bit
// of it. The list is short and cacheable for that reason.
export const GET: RequestHandler = async ({ platform, setHeaders }) => {
  const store = openStore(platform);
  const revoked = await store.revokedStatusIndexes();

  setHeaders({ "cache-control": "public, max-age=300" });
  return json({
    id: STATUS_LIST,
    issuer: ISSUER,
    type: "BitstringStatusList",
    statusPurpose: "revocation",
    encodedList: await encodedStatusList(revoked),
  });
};

export const prerender = false;
