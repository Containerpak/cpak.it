<script>
  import ProjectStrip from "$lib/components/ProjectStrip.svelte";
</script>

<ProjectStrip />

<footer class="w-full bg-slate-100">
  <div
    class="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 text-sm sm:grid-cols-2 lg:grid-cols-5"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <img src="/cpak-brand.svg" alt="cpak logo" class="theme-logo-light" />
        <img
          src="/presskit/full/cpak-brand-dark.svg"
          alt="cpak logo"
          class="theme-logo-dark h-[46px] w-[104px] object-contain"
        />
      </div>
      <p class="leading-relaxed text-gray-600">
        Decentralized software distribution for any context.
      </p>
    </div>

    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900">Product</h3>
      <a href="/store" class="block text-gray-600 hover:underline">Store</a>
      <a href="/docs/quick-start" class="block text-gray-600 hover:underline"
        >Get started</a
      >
      <a href="/docs/updates" class="block text-gray-600 hover:underline"
        >Updates</a
      >
    </div>

    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900">Developers</h3>
      <a href="/docs" class="block text-gray-600 hover:underline"
        >Documentation</a
      >
      <a href="/docs/first-package" class="block text-gray-600 hover:underline"
        >Build a package</a
      >
      <a href="/docs/manifest" class="block text-gray-600 hover:underline"
        >Manifest v2</a
      >
      <a href="/docs/contributing" class="block text-gray-600 hover:underline"
        >Contributing</a
      >
      <a href="/learn" class="block text-gray-600 hover:underline">Learn cpak</a
      >
      <a href="/verify" class="block text-gray-600 hover:underline"
        >Check a credential</a
      >
    </div>

    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900">Project</h3>
      <a
        href="https://github.com/Containerpak"
        class="block text-gray-600 hover:underline">GitHub</a
      >
      <a href="/announcements" class="block text-gray-600 hover:underline"
        >Announcements</a
      >
      <a href="/branding" class="block text-gray-600 hover:underline"
        >Branding</a
      >
      <a href="/support" class="block text-gray-600 hover:underline"
        >Support cpak</a
      >
    </div>

    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900">Legal</h3>
      <a href="/legal/terms" class="block text-gray-600 hover:underline"
        >Terms of Service</a
      >
      <a href="/legal/privacy" class="block text-gray-600 hover:underline"
        >Privacy Policy</a
      >
    </div>
  </div>

  <div
    class="border-t border-slate-200 px-6 py-6 text-center text-xs text-gray-500"
  >
    A project by <a
      href="https://bromb.in/"
      class="font-medium text-gray-700 hover:underline">Mirko Brombin</a
    >, made with the cpak community. © {new Date().getFullYear()}.
  </div>
</footer>
