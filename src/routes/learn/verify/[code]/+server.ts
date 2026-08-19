// Verification used to live here. Links handed out from this address are in
// other people's records and in other people's inboxes, so the address keeps
// working and says permanently where it went.

import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ params }) => {
  redirect(308, `/verify/${params.code}`);
};
