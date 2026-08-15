<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
  <title>File access without the whole home - cpak</title>
  <meta
    name="description"
    content="cpak 2.4 lets applications use their normal file chooser while keeping host file access explicit and narrow."
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
      cpak 2.4
    </p>
    <h1
      class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
    >
      File access without the whole home
    </h1>
    <p class="mt-6 text-xl leading-8 text-gray-600">
      An application can now use its normal file chooser, receive exactly what
      the user selected and keep the rest of the host home outside its
      environment.
    </p>

    <div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
      <p>
        Desktop packages often receive broad filesystem access for a very small
        reason. A browser needs one upload, a document editor needs one file,
        while Bottles needs the executable selected by the user and sometimes
        the files beside it. Mounting the complete home solves each case, but it
        also makes every unrelated document available to the application.
      </p>
      <p>
        cpak 2.4 adds file grants to the runtime. The application opens the same
        chooser it already uses. After the user makes a selection, cpak attaches
        that object to the running package and returns a path below <code
          >/run/cpak/grants</code
        >. The selected file is read-only by default. Access to its parent
        folder is a separate choice, and applications that need to save receive
        a writable view of the chosen destination directory.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Your desktop file chooser
      </h2>
      <p>
        An application does not need a cpak-specific picker or a patch to its
        toolkit. GTK and GIO file chooser calls enter a restricted desktop-bus
        adapter inside the package. That adapter understands the chooser request
        but does not expose the host session bus unless the manifest grants it.
        Other applications can use the <code>cpak-file-picker</code> compatibility
        command and receive the same result.
      </p>
      <p>
        The host remains responsible for presenting the file chooser. If it
        cannot include cpak's scope and lifetime choices, a second confirmation
        asks whether the selected file should include its parent folder and
        whether the grant should survive the current run. A closed or denied
        confirmation gives the application nothing.
      </p>
      <p>
        Those confirmations can follow the current desktop. The official binary
        includes small Adwaita, GTK, KDE and Qt adapters, then extracts only the
        selected one. <a
          class="font-semibold text-[#3E7BFF] hover:underline"
          href="/docs/desktop-dialogs#distribution-builds"
          >A distribution can build cpak with one adapter, install its own
          helper or keep the built-in interface</a
        >. Every native adapter uses the host toolkit and theme, while the
        built-in interface remains available when a toolkit is missing.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        A selection becomes a verified mount
      </h2>
      <p>
        A path string is not enough for a security boundary because the file
        behind it can change between selection and use. cpak resolves the
        selection on the host, opens it and sends the descriptor to the active
        mount namespace over a private Unix socket. The mount worker verifies
        its type and identity before attaching a read-only or restricted
        writable mount. The application cannot replace that descriptor with an
        arbitrary host path.
      </p>
      <p>
        Session grants disappear when the environment stops. A persistent grant
        belongs to one package origin and is restored on later launches until
        the user revokes it. Revocation also stops the active environment so an
        old mount cannot remain usable. Existing filesystem permissions remain
        valid: a selection inside an already mounted directory keeps its normal
        path and does not ask twice.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Package policy stays explicit
      </h2>
      <p>
        The manifest chooses which operations an application may request. It can
        enable existing files, folders or save destinations independently, then
        decide whether persistent and parent-folder grants may be offered.
      </p>
      <pre
        class="overflow-x-auto rounded-xl bg-slate-950 p-5 text-base text-slate-100"><code
          >{`"filePicker": {
  "openFile": true,
  "openFolder": false,
  "saveFile": true,
  "persistent": true,
  "containingFolder": false
}`}</code
        ></pre>
      <p>
        The same policy works without a desktop bus. Interactive selection fails
        closed on a headless host, while declared filesystem paths and existing
        grants remain available to server workloads. Users can inspect and
        revoke persistent access with <code>cpak grant</code> from either the CLI
        or the built-in manager.
      </p>
      <p>
        Read the <a
          class="font-semibold text-[#3E7BFF]"
          href="/docs/file-access">file access guide</a
        >
        for package policy and grant management, or the
        <a class="font-semibold text-[#3E7BFF]" href="/docs/desktop-dialogs"
          >desktop adapter guide</a
        >
        for distribution builds and backend selection.
      </p>
    </div>

    <a
      href="https://github.com/Containerpak/cpak/releases/tag/v2.4.0"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-14 inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
    >
      View cpak 2.4
      <span class="material-symbols-outlined">open_in_new</span>
    </a>
  </article>
</main>

<Footer />
