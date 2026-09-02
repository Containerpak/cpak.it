<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
  <title>Manifest v3, with room for real desktop applications - cpak</title>
  <meta
    name="description"
    content="cpak 2.9.5 keeps the stricter manifest v3 boundary while providing confined X11 and Bluetooth access for desktop applications."
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
      cpak 2.9.5 / August 28, 2026
    </p>
    <h1
      class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
    >
      Manifest v3, with room for real desktop applications
    </h1>
    <p class="mt-6 text-xl leading-8 text-gray-600">
      cpak 2.9.5 keeps the stricter package contract introduced by manifest v3
      and restores the desktop paths applications still need, without returning
      the host X11 display or system bus.
    </p>

    <div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
      <p>
        A package boundary is useful only when it can carry the software people
        actually run. Users expect a browser to open on an X11 desktop and pair
        with a security key. Developers need a manifest that can ask for those
        abilities without quietly asking for everything around them. Manifest v3
        was introduced to make that request readable and enforceable.
      </p>
      <p>
        Two changes form the base of v3. A package now names the exact OCI image
        that was built and signed. Desktop permissions no longer hand complete
        host communication sockets to the application. One makes updates
        predictable; the other makes the boundary visible before the application
        starts.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        The package no longer moves under the manifest
      </h2>
      <p>
        Tags such as <code>main</code> and <code>latest</code> are useful publishing
        pointers, but they can refer to new bytes after every build. A manifest that
        names one of them can stay unchanged while the application behind it changes.
        That weakens review and signing while making rollback harder, because the
        name no longer identifies one result.
      </p>
      <p>
        Manifest v3 uses a digest-pinned image reference instead. The manifest
        and signature now identify the same immutable OCI object served by the
        registry. Publishers can continue to build with familiar tags; their
        release workflow records the resulting digest in <code>cpak.json</code> before
        the package state is signed.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        A permission should describe the need
      </h2>
      <p>
        A raw bus socket says where an application can send messages, not which
        operation it is allowed to perform. Raw X11 has a similar cost: the same
        connection that draws a window can expose input and other clients on the
        host display. v3 therefore replaced those broad switches with
        permissions for concrete desktop operations. Notifications, external
        links, file selection and host application launches each have their own
        path. Other session bus use can be limited to named services, objects
        and methods.
      </p>
      <p>
        That direction was right, but the first v3 publication stopped too
        early. Removing raw X11 did not remove the applications that still
        depend on X11. Bluetooth could not be reduced to one authentication flow
        either. It also covers discovery, pairing, GATT devices, application
        agents and profiles that carry their own connections. A permission model
        has to express legitimate use as carefully as it refuses excess access.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Private paths for X11 and BlueZ
      </h2>
      <p>
        cpak 2.9.5 adds <code>displayX11</code> for applications that need X11 compatibility.
        cpak starts a nested Xwayland display on Wayland or a nested Xephyr display
        on X11. The package receives that display's socket and a private authentication
        cookie. It never receives the host X11 socket or the authority file used
        by other applications.
      </p>
      <p>
        The new <code>bluetooth</code> permission provides the general BlueZ API
        through a private proxy at the conventional system bus path. Existing BlueZ
        clients can use discovery, pairing, GATT, agents, profiles, signals, callbacks
        and file descriptors without an application-specific protocol. Calls to unrelated
        system services are refused, bus enumeration is hidden and raw HCI access
        remains outside this permission.
      </p>
      <p>
        Neither path makes D-Bus a requirement for cpak itself. The proxy is
        part of the cpak binary and is started only for a package that declares
        Bluetooth. Hosts need BlueZ and its existing system bus for that
        package; headless packages and desktop applications that do not request
        Bluetooth gain no new dependency.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        One complete 2.9 release
      </h2>
      <p>
        When this announcement was published, cpak 2.9.5 superseded 2.9.4 and
        completed the 2.9 line. It included manifest v3, the Discover backend,
        signed installer catalog work, the trust and sandbox fixes released
        during the week, and the new X11 and Bluetooth paths. Use the latest
        stable release for a new installation; the link below remains the
        historical 2.9.5 release.
      </p>
      <p>
        Existing manifest v1 and v2 packages remain readable. New packages can
        move to v3 when their image is pinned and each removed raw socket has an
        explicit replacement. The official Containerpak packages, Bottles and
        Bottles Next already use the v3 contract, so the same rules documented
        for publishers are exercised by the public Store.
      </p>
    </div>

    <div class="mt-14 flex flex-wrap gap-3">
      <a
        href="/docs/manifest"
        class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
      >
        Read the manifest reference
        <span class="material-symbols-outlined">arrow_forward</span>
      </a>
      <a
        href="https://github.com/Containerpak/cpak/releases/tag/v2.9.5"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
      >
        View cpak 2.9.5
        <span class="material-symbols-outlined">open_in_new</span>
      </a>
    </div>
  </article>
</main>

<Footer />
