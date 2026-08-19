<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";

  const BOARDS = [
    {
      href: "/learn/play/permissions",
      title: "Permission board",
      blurb:
        "Tick a permission and read the host paths it binds into the container, and the list of permissions the manifest stays silent about.",
      doc: { href: "/docs/permissions", label: "Permissions" },
    },
    {
      href: "/learn/play/filesystem",
      title: "Filesystem board",
      blurb:
        "Write the filesystem list a manifest would carry and read the host directory each entry comes from and the path the application finds it at.",
      doc: { href: "/docs/file-access", label: "File access" },
    },
    {
      href: "/learn/play/ceiling",
      title: "The ceiling board",
      blurb:
        "Set a manifest, an owner override and an administrator ceiling against each other and read what survives all three.",
      doc: { href: "/docs/managed-deployment", label: "Managed deployment" },
    },
    {
      href: "/learn/play/migration",
      title: "The migration board",
      blurb:
        "Put a version 1 manifest in and read the version 2 manifest cpak writes, field by field, with what each one became.",
      doc: { href: "/docs/manifest", label: "Manifest" },
    },
    {
      href: "/learn/play/desktop-entry",
      title: "Desktop entry board",
      blurb:
        "Paste the .desktop file an image ships and read the two files cpak exports for it, line by line, Exec included.",
      doc: { href: "/docs/system-integration", label: "System integration" },
    },
  ];
</script>

<Seo
  title="Learn - cpak"
  description="The cpak learning area: boards that answer questions about permissions, filesystem access, ceilings, migration and desktop entries by running cpak's own decision code in the page."
  path="/learn"
/>

<div class="mx-auto max-w-7xl px-6 py-12 lg:py-16">
  <h1 class="text-4xl font-extrabold tracking-tight text-gray-900">Learn</h1>
  <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
    Documentation says what cpak does. This area shows it deciding. Every board
    below sends its question to cpak's own decision code, built to WebAssembly
    and running in the page you are reading, so the answers are the ones your
    machine would give and not a description of them.
  </p>
  <p class="mt-3 max-w-3xl leading-7 text-gray-600">
    Nothing you type is uploaded. Each board resolves against a written-down
    host, so two people comparing the same board see the same answer.
  </p>

  <h2 class="mt-12 text-sm font-semibold text-gray-900">Boards</h2>
  <div class="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each BOARDS as board}
      <section
        class="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 class="text-lg font-semibold text-gray-900">
          <a href={board.href} class="hover:underline">{board.title}</a>
        </h3>
        <p class="mt-2 flex-1 leading-7 text-gray-600">{board.blurb}</p>
        <p class="mt-4 text-sm">
          <a
            href={board.doc.href}
            class="font-medium text-[#4670EC] hover:underline"
          >
            {board.doc.label}
          </a>
          <span class="text-gray-500"> is the reference behind it.</span>
        </p>
      </section>
    {/each}
  </div>
</div>
