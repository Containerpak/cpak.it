<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
  <title>X11 apps get their own private display - cpak</title>
  <meta
    name="description"
    content="cpak gives X11 applications a private display instead of connecting them to the X11 session shared by the rest of your desktop."
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
      Desktop security / September 13, 2026
    </p>
    <h1
      class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
    >
      X11 apps get their own private display
    </h1>
    <p class="mt-6 text-xl leading-8 text-gray-600">
      Some Linux apps still need X11. cpak lets them open beside your other
      windows without placing them on the X11 display shared by the rest of your
      desktop.
    </p>

    <div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
      <p>
        X11 comes from a desktop where applications trusted one another. Two
        apps on the same display can have much more contact than their windows
        suggest, including access to input and other X11 windows.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        A separate display for each cpak app
      </h2>
      <p>
        An X11 app in cpak receives a small private display. cpak presents its
        windows on your desktop, but the app never receives the connection used
        by your other X11 applications.
      </p>
      <p>
        Launch the app as usual. Packages that declare <code>displayX11</code>
        receive this setup automatically on both Wayland and X11 desktops.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Copy and paste stays under your control
      </h2>
      <p>
        A package asks separately before it can copy data into or out of its
        display. cpak passes supported text and images, while file lists stay on
        their original side.
      </p>
      <p>
        The app still has its normal window, title, icon, resize and fullscreen
        behavior. File, device and network access continue to follow their own
        permissions.
      </p>

      <div class="flex flex-wrap gap-3 pt-4">
        <a
          href="/docs/permissions#displays-and-bluetooth"
          class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
        >
          Read the display permissions
          <span class="material-symbols-outlined">arrow_forward</span>
        </a>
        <a
          href="https://github.com/Containerpak/cpak/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
        >
          Get the latest cpak
          <span class="material-symbols-outlined">open_in_new</span>
        </a>
      </div>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        How X11 access compares
      </h2>
      <p>
        This table compares the normal X11 path used by each format. Individual
        packages can always apply extra restrictions of their own.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-base">
          <thead>
            <tr class="border-b border-slate-300 text-gray-900">
              <th class="py-3 pr-5 font-semibold">Format</th>
              <th class="py-3 pr-5 font-semibold">What the app shares</th>
              <th class="py-3 font-semibold">Copy and paste</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-200">
              <td class="py-3 pr-5">cpak</td>
              <td class="py-3 pr-5">A private display made for that app</td>
              <td class="py-3">Allowed by direction, for text and images</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="py-3 pr-5">Flatpak</td>
              <td class="py-3 pr-5">
                <a
                  class="font-semibold text-[#3E7BFF] hover:underline"
                  href="https://docs.flatpak.org/en/latest/sandbox-permissions.html"
                  target="_blank"
                  rel="noopener noreferrer">Host X11 socket</a
                > when X11 access is enabled
              </td>
              <td class="py-3">Shared with the same X11 display</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="py-3 pr-5">Snap</td>
              <td class="py-3 pr-5">
                <a
                  class="font-semibold text-[#3E7BFF] hover:underline"
                  href="https://snapcraft.io/docs/reference/interfaces/x11-interface/"
                  target="_blank"
                  rel="noopener noreferrer">Host X server</a
                > through the X11 interface
              </td>
              <td class="py-3">Shared with the same X11 display</td>
            </tr>
            <tr>
              <td class="py-3 pr-5">Native DEB or RPM</td>
              <td class="py-3 pr-5">Host X11 display by default</td>
              <td class="py-3">Shared with the same X11 display</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </article>
</main>

<Footer />
