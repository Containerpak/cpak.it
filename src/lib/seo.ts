// Two parts of the site answer to somebody who was handed an address and to
// nobody else: the verification pages and a signed-in account. Neither is
// listed anywhere and neither should be indexed.
//
// It is decided here, once, rather than on each page, because the layout says
// "index, follow" for the whole site and a page adding its own tag underneath
// leaves two answers in the same document. An error page and a redirect also
// have no page of their own to say it on.

const PRIVATE = ["/verify", "/learn/account"];

export const INDEXED =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const NOT_INDEXED = "noindex, nofollow";

export function robotsFor(pathname: string) {
  const kept = PRIVATE.some(
    (start) => pathname === start || pathname.startsWith(`${start}/`),
  );
  return kept ? NOT_INDEXED : INDEXED;
}
