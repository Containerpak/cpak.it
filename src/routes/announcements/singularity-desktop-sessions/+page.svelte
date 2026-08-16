<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
  <title>A whole desktop, packed with cpak - cpak</title>
  <meta
    name="description"
    content="cpak can now install complete desktop sessions, with Singularity Desktop as the first project to use the new capability."
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
      Desktop / August 16, 2026
    </p>
    <h1
      class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
    >
      A whole desktop, packed with cpak
    </h1>
    <p class="mt-6 text-xl leading-8 text-gray-600">
      When I started cpak in September 2023, I wanted to know whether I could
      simply build a Docker image of my software and make it behave like a real
      Linux application anywhere, without spending the rest of the week wiring
      graphics, audio and desktop integration by hand, and this week that
      question became much bigger because cpak can now start the desktop itself.
    </p>

    <div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
      <p>
        Five months before
        <a
          class="font-semibold text-[#3158c7] underline underline-offset-4"
          href="https://github.com/Containerpak/cpak/commit/8c874eca2e7b7379ff5f877f82aebaeff361b490"
          >that first cpak commit</a
        >
        I had announced Singularity Desktop, and although the two projects started
        for different reasons, they kept circling the same idea: software should
        be able to travel without feeling like a guest once it reaches another Linux
        system. For almost three years they grew beside each other, and now their
        two alphas meet at the login screen.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Now they can break each other
      </h2>
      <p>
        cpak already knew how to assemble an application from OCI layers, keep
        its writable data between updates and connect it to the parts of the
        machine it had permission to use, so putting the Singularity compositor,
        shell and applications into an image was surprisingly simple. The real
        work began at the login screen, where cpak had to register the session
        before any graphical environment existed, without giving the package
        arbitrary access to the host.
      </p>
      <p>
        Singularity needs laptops, graphics drivers and daily habits that do not
        exist on my setup, while cpak needs a workload large enough to expose
        the assumptions hidden in its new session support, so putting the two
        alphas together gives each one the test it was missing.
      </p>
      <p>
        A package can now declare a desktop or kiosk session, cpak shows what it
        is asking for and the system authority registers the login entry only
        after the user authorizes it, then removes it again when the capability
        is disabled or the package disappears. The manifest, permission model
        and display-manager setup are covered in the
        <a
          class="font-semibold text-[#3158c7] underline underline-offset-4"
          href="/docs/desktop-sessions">desktop session documentation</a
        >, including the same mechanism for focused kiosk sessions.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        A package, not a second computer
      </h2>
      <p>
        Singularity is split into a small runtime with its common userspace and
        a second image carrying the session, so cpak can reuse the runtime
        across updates and replace the software without touching its writable
        profile. The host still provides the kernel and drivers, while the
        package receives the hardware, services and user folders declared in its
        permissions.
      </p>
      <p>
        The difference became obvious the first time I opened the application
        launcher and found the software already installed on my computer. My
        files were still in their usual XDG folders and the applications were
        still mine, so the result no longer felt like a demo sealed inside an
        image, it felt like Singularity running on my computer.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        A real day is the test
      </h2>
      <p>
        Installing the same Singularity build I use removes a long compilation
        from the beginning of every report, then leaves both projects nowhere to
        hide once somebody starts using the session for a real day. Suspend,
        unusual monitors, updates and applications kept open for hours can now
        test the package format and its first complete environment at the same
        time.
      </p>
      <p>
        This does not replace the packages that distributions are already
        preparing for Singularity, and I still want to work with every project
        carrying it natively. It gives Singularity one more official route onto
        other distributions today, while cpak gets a real session workload
        instead of another example written only for its documentation.
      </p>
    </div>

    <div class="mt-14 flex flex-wrap gap-3">
      <a
        href="/docs/desktop-sessions"
        class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
      >
        Read the session documentation
        <span class="material-symbols-outlined">arrow_forward</span>
      </a>
      <a
        href="https://github.com/singularityos-lab/singularity-desktop"
        class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
      >
        View Singularity Desktop
        <span class="material-symbols-outlined">open_in_new</span>
      </a>
    </div>
  </article>
</main>

<Footer />
