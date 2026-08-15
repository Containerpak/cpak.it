<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
  <title>The platform under every official cpak - cpak</title>
  <meta
    name="description"
    content="Official cpak packages now share versioned Ubuntu 26.04 platform images, narrower toolkit layers and locale data selected by the runtime."
  />
</svelte:head>

<Header />

<main>
  <article class="mx-auto max-w-3xl px-6 py-20">
    <a
      href="/announcements"
      class="inline-flex items-center gap-1 text-sm font-semibold text-[#3E7BFF] hover:text-[#3158c7]"
    >
      <span class="material-symbols-outlined text-base">arrow_back</span>
      Announcements
    </a>
    <p
      class="mt-12 text-sm font-semibold tracking-[0.16em] text-[#3E7BFF] uppercase"
    >
      Platform / August 15, 2026
    </p>
    <h1
      class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
    >
      The platform under every official cpak
    </h1>
    <p class="mt-6 text-xl leading-8 text-gray-600">
      Every package in the official catalogue has been rebuilt on a new family
      of versioned Ubuntu 26.04 platform images. Applications remain normal OCI
      images, but packages that need the same runtime can now reuse it instead
      of downloading another copy.
    </p>

    <div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
      <p>
        cpak does not require one distribution or one build system. A package
        can start from any OCI image that supplies the ABI expected by its
        application. The official catalogue uses a controlled Ubuntu snapshot
        because it gives package recipes APT without making each application
        carry a complete distribution of its own. The resulting foundation is
        flattened into one layer after package indexes, downloaded archives,
        manuals and build-only files have been removed.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        The old desktop base did too much
      </h2>
      <p>
        I split the platform around the libraries applications actually use. A
        GTK 3 package starts from <code>gtk3</code>; WebKitGTK 4.1 adds one layer
        above it. GTK 4, libadwaita and WebKitGTK 6 have their own branch, while
        multilib software keeps a separate graphics path. The complete
        <code>desktop</code> image remains available for software that really
        crosses those boundaries and for existing recipes that still use it.
      </p>
      <pre
        class="overflow-x-auto rounded-xl bg-slate-950 p-5 text-base text-slate-100"><code
          >{`foundation
└── mesa64
    ├── gtk3
    │   └── webkitgtk
    ├── gtk4
    │   └── adwaita
    │       └── webkitgtk6
    └── mesa-multilib`}</code
        ></pre>
      <p>
        A GTK 3 update no longer invalidates the GTK 4 or multilib branches, and
        an application update keeps every unchanged platform layer already in
        the local store.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Your locale is downloaded once
      </h2>
      <p>
        Application translation catalogs still belong to each application.
        Compiled system locale data does not. cpak 2.4.1 reads the locale used by
        the host and attaches only that data from the matching
        <code>locales</code> image. The layer is downloaded once and reused by
        every compatible package. Application overrides still win, and other
        publishers opt in by declaring their own locale image.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Versioned foundations, normal package reviews
      </h2>
      <p>
        <code>main</code> follows the newest platform build,
        <code>ubuntu-26.04</code> follows that Ubuntu release and
        <code>ubuntu-26.04.20260814.4</code> identifies one exact state. Official
        packages follow the release tag, but a new platform never appears inside
        them silently: each package is rebuilt and checked by its own CI first.
      </p>
      <p>
        For this rollout, every package listed in the official Store is being
        rebuilt on the new bases. SDKs and Wine-based packages follow the same
        chain, so the catalogue moves to one platform generation instead of
        updating piece by piece.
      </p>
      <p>
        Package maintainers only need to choose the smallest matching platform,
        keep build tools outside the final stage and pull the current platform
        digest during CI. The complete platform table, tag policy, SDK
        equivalents and recipe examples are in the
        <a
          class="font-semibold text-[#3E7BFF] hover:underline"
          href="/docs/images">OCI image guide</a
        >. The earlier
        <a
          class="font-semibold text-[#3E7BFF] hover:underline"
          href="/announcements/smaller-images-with-apt">catalogue diagnosis</a
        >
        contains the download and installed-size measurements behind this work.
      </p>
    </div>

    <a
      href="/docs/images"
      class="mt-14 inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
    >
      Build on the cpak platform
      <span class="material-symbols-outlined">arrow_forward</span>
    </a>
  </article>
</main>

<Footer />
