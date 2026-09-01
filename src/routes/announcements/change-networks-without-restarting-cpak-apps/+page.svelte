<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
  <title>Change networks without restarting your cpak apps - cpak</title>
  <meta
    name="description"
    content="cpak 2.11.1 refreshes isolated application networking after a resolver change without sharing the host network or restarting the container."
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
      cpak 2.11.1 / September 1, 2026
    </p>
    <h1
      class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
    >
      Change networks without restarting your cpak apps
    </h1>
    <p class="mt-6 text-xl leading-8 text-gray-600">
      Switch Wi-Fi or enter a VPN and keep the same application container. cpak
      2.11.1 refreshes its private network in place while host localhost stays
      closed.
    </p>

    <div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
      <p>
        Before 2.11.1, changing networks could leave a running cpak app without
        DNS. The window stayed open, but browsers stopped loading pages and
        connected apps appeared offline until you restarted them.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Keep your app running when the network changes
      </h2>
      <p>
        cpak now renews the app's private connection when your computer receives
        new DNS settings. The container stays open, so your session and anything
        running in the background remain where you left them.
      </p>
      <p>
        Update cpak to 2.11.1 and keep using your apps normally. The change is
        automatic when you switch networks or connect to a VPN.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        The connection stays private
      </h2>
      <p>
        An app with the ordinary <code>network</code> permission can reach the
        internet and services on your local network. It still cannot reach
        services bound only to your computer's localhost. A network change does
        not weaken that boundary.
      </p>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-base">
          <thead>
            <tr class="border-b border-slate-300 text-gray-900">
              <th class="py-3 pr-5 font-semibold">Manifest</th>
              <th class="py-3 pr-5 font-semibold">Network boundary</th>
              <th class="py-3 font-semibold">Host localhost</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-200">
              <td class="py-3 pr-5"><code>network: false</code></td>
              <td class="py-3 pr-5">Private, with no external route</td>
              <td class="py-3">Blocked</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="py-3 pr-5"><code>network: true</code></td>
              <td class="py-3 pr-5">Private, with internet and LAN access</td>
              <td class="py-3">Blocked</td>
            </tr>
            <tr>
              <td class="py-3 pr-5">
                <code>network: true</code> + <code>hostNetwork: true</code>
              </td>
              <td class="py-3 pr-5">Shared with the host</td>
              <td class="py-3">Available</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Most apps should keep <code>network: true</code>. If an app needs a local
        development server, bind the server to the machine's LAN address. Add
        <code>hostNetwork: true</code> only when the app must connect to a service
        available exclusively on <code>127.0.0.1</code>.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        Existing packages need no changes
      </h2>
      <p>
        If a package already requests <code>network</code>, it receives the new
        behavior as soon as cpak is updated. Package authors do not need to add a
        permission or change their manifest.
      </p>
      <p>
        Packages without <code>network</code> remain offline. The
        <a class="font-semibold text-[#3E7BFF]" href="/docs/permissions"
          >permissions reference</a
        > explains when to use private networking and when explicit host access
        is required.
      </p>
    </div>

    <div class="mt-14 flex flex-wrap gap-3">
      <a
        href="/docs/permissions"
        class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
      >
        Read the network permissions
        <span class="material-symbols-outlined">arrow_forward</span>
      </a>
      <a
        href="https://github.com/Containerpak/cpak/releases/tag/v2.11.1"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
      >
        View cpak 2.11.1
        <span class="material-symbols-outlined">open_in_new</span>
      </a>
    </div>
  </article>
</main>

<Footer />
