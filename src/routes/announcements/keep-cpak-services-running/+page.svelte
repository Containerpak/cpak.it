<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
  <title>Keep cpak services running after reboot - cpak</title>
  <meta
    name="description"
    content="cpak 2.12 keeps application services running, restores them after reboot and reports process, health and listener state in one place."
  />
</svelte:head>

<Header />

<main>
  <article class="mx-auto max-w-4xl px-6 py-20">
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
      cpak 2.12.0 / September 2, 2026
    </p>
    <h1
      class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
    >
      Keep cpak services running after reboot
    </h1>
    <p class="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
      cpak 2.12 can keep an application command running, restart it after a
      failure and restore it when the machine starts. Its status now shows the
      package, process, health and listening ports together.
    </p>

    <div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
      <h2 class="pt-2 text-3xl font-bold tracking-tight text-gray-900">
        Name the application command once
      </h2>
      <p>
        A package can declare a named service command in its manifest. The
        manifest records the executable and its arguments, so each deployment
        can start the same application mode without rebuilding a command line.
      </p>
      <pre
        class="overflow-x-auto rounded-xl bg-slate-950 p-5 text-base text-slate-100"><code
          >{`"services": {
  "server": {
    "binary": "/usr/bin/example",
    "arguments": ["serve", "--port", "3000"]
  }
}`}</code
        ></pre>
      <p>
        Run it once with
        <code>cpak run --service server github.com/example/app</code>, or enable
        it as a persistent service with its own restart policy, health check and
        dependencies.
      </p>
      <pre
        class="overflow-x-auto rounded-xl bg-slate-950 p-5 text-base text-slate-100"><code
          >{`cpak service enable app-prod github.com/example/app \
  --service server \
  --restart on-failure`}</code
        ></pre>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Restore services on different Linux hosts
      </h2>
      <p>
        cpak uses the host startup mechanism that is available. It can install a
        systemd user service, a cron reboot entry or XDG autostart. The cpak
        service manager itself does not require systemd or D-Bus. When a host
        can restore applications only after login, <code
          >cpak service setup</code
        >
        reports that limit.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Pass deployment configuration without changing the image
      </h2>
      <p>
        <code>--env</code> and <code>--env-file</code> provide deployment
        values.
        <code>--secret NAME=/path</code> validates a private file and mounts it
        read-only below <code>/run/secrets</code>. Secret contents are not
        copied into the service definition or printed by service commands.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        See whether the application is ready
      </h2>
      <p>
        <code>cpak ps</code>, <code>status</code>, <code>inspect</code> and
        <code>health</code> expose one runtime view. It includes the container,
        process, health result, running time and listener ports. JSON output is
        available for scripts, and <code>cpak health</code> returns a failing status
        when the application is not ready.
      </p>
      <pre
        class="overflow-x-auto rounded-xl bg-slate-950 p-5 text-base text-slate-100"><code
          >{`cpak ps
cpak status github.com/example/app --instance app-prod --json
cpak health github.com/example/app --instance app-prod`}</code
        ></pre>

      <p>
        Existing interactive applications do not need a change. Package authors
        add a manifest service only when the application has a command worth
        naming, and operators choose whether to keep it running.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Better isolated X11 windows
      </h2>
      <p>
        X11 applications now follow the Xephyr window size and pass their title,
        icon and fullscreen state to the host desktop. Closing the last
        application window stops its cpak instance.
      </p>
      <p>
        Packages can declare clipboard access in either direction. cpak copies
        approved text and image targets through its built-in broker while file
        lists, the host X11 socket and its authority file stay outside the
        package. No clipboard tool or D-Bus service is required in the image.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Edit complex permissions
      </h2>
      <p>
        <code>cpak override edit &lt;origin&gt;</code> opens the complete
        override JSON in your editor. For scripts, nested keys such as
        <code>sessionBus.own</code> accept arrays and objects directly through
        <code>--value</code>.
      </p>
    </div>

    <div class="mt-14 flex flex-wrap gap-3">
      <a
        href="/docs/services"
        class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
      >
        Configure a persistent service
        <span class="material-symbols-outlined">arrow_forward</span>
      </a>
      <a
        href="https://github.com/Containerpak/cpak/releases/tag/v2.12.0"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
      >
        View cpak 2.12.0
        <span class="material-symbols-outlined">open_in_new</span>
      </a>
    </div>
  </article>
</main>

<Footer />
