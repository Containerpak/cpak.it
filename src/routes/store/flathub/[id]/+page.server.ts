import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { SITE_URL, fetchStore, jsonLd } from "$lib/store";
import {
  FLATHUB_ONLY_CATEGORIES,
  FLATHUB_SOURCES,
  categoryForFlathub,
  fetchFlathubCategory,
  flathubAppUrl,
  descriptionBlocks,
  fetchFlathubAppstream,
  flathubInstallCommand,
  isFlathubAppId,
} from "$lib/flathub";

type Screenshot = { sizes?: Array<{ width: string; src: string }> };

function pickScreenshot(shot: Screenshot) {
  const sizes = (shot.sizes ?? []).filter((size) => size.src);
  if (!sizes.length) return null;
  const ranked = [...sizes].sort(
    (left, right) =>
      Math.abs(Number(left.width) - 1248) - Math.abs(Number(right.width) - 1248),
  );
  return ranked[0].src;
}

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
  if (!isFlathubAppId(params.id)) error(404, "Application not found");
  const [app, store] = await Promise.all([
    fetchFlathubAppstream(fetch, params.id),
    fetchStore(fetch),
  ]);
  if (!app || app.type !== "desktop-application")
    error(404, "Application not found");
  if (app.is_eol) error(410, "This application is no longer maintained on Flathub");

  const category = categoryForFlathub(app.categories) ?? "Utilities";
  const categoryMeta = store?.categories[category] ??
    (FLATHUB_ONLY_CATEGORIES[category]
      ? {
          icon: FLATHUB_ONLY_CATEGORIES[category].icon,
          color: FLATHUB_ONLY_CATEGORIES[category].color,
        }
      : { icon: "inventory_2", color: "#3E7BFF" });
  const screenshots = ((app.screenshots ?? []) as Screenshot[])
    .map(pickScreenshot)
    .filter((src): src is string => Boolean(src))
    .slice(0, 8);
  const urls = (app.urls ?? {}) as Record<string, string | null>;
  const canonicalPath = `/store/flathub/${params.id}`;
  const canonical = `${SITE_URL}${canonicalPath}`;
  const summary = app.summary ?? "";

  const peers = await fetchFlathubCategory(fetch, FLATHUB_SOURCES[category], 1, 8);
  const related = (peers?.apps ?? [])
    .filter((peer) => peer.id !== params.id)
    .slice(0, 3)
    .map((peer) => ({
      name: peer.name,
      description: peer.summary,
      slug: peer.id,
      href: flathubAppUrl(peer.id),
      icon: peer.icon,
    }));
  const readme = descriptionBlocks(app.description)
    .map((block) =>
      block.kind === "p"
        ? block.text
        : block.items
            .map((item, index) => (block.kind === "ol" ? `${index + 1}. ${item}` : `- ${item}`))
            .join("\n"),
    )
    .join("\n\n");
  const links = [
    { label: "Flathub page", href: `https://flathub.org/apps/${params.id}` },
    { label: "Website", href: urls.homepage },
    { label: "Source code", href: urls.vcs_browser },
    { label: "Report a problem", href: urls.bugtracker },
  ].filter((link): link is { label: string; href: string } =>
    Boolean(link.href && /^https:\/\//.test(link.href)),
  );

  setHeaders({ "cache-control": "public, max-age=300, s-maxage=3600" });
  return {
    category,
    categoryDescription: "",
    categoryMeta,
    canonicalPath,
    schema: jsonLd({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: app.name,
      description: summary,
      url: canonical,
      image: app.icon,
      screenshot: screenshots,
      operatingSystem: "Linux",
      softwareRequirements: "cpak on Linux",
    }),
    related,
    dependencyLinks: {},
    pkg: {
      origin: params.id as string,
      name: app.name as string,
      description: summary,
      version: (app.releases?.[0]?.version ?? "") as string,
      architectures: ["amd64"],
      icon: (app.icon ?? "") as string,
      screenshots,
      showcase: null,
      storeReadme: readme || null,
      storeReadmeUrl: null,
      cpak: { binaries: [], desktop_entries: [], dependencies: [], addons: [], override: {} },
      flathub: {
        command: flathubInstallCommand(params.id),
        developer: (app.developer_name ?? "") as string,
        license: (app.project_license ?? "") as string,
        links,
      },
    },
  };
};
