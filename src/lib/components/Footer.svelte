<script>
  import ProjectStrip from "$lib/components/ProjectStrip.svelte";
  import * as m from "$lib/paraglide/messages.js";
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
        {m.footer_description()}
      </p>
    </div>

    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900">{m.footer_product()}</h3>
      <a href="/store" class="block text-gray-600 hover:underline">{m.footer_store()}</a>
      <a href="/docs/quick-start" class="block text-gray-600 hover:underline"
        >{m.get_started()}</a
      >
      <a href="/docs/updates" class="block text-gray-600 hover:underline"
        >{m.footer_updates()}</a
      >
    </div>

    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900">{m.footer_developers()}</h3>
      <a href="/docs" class="block text-gray-600 hover:underline"
        >{m.documentation()}</a
      >
      <a href="/docs/first-package" class="block text-gray-600 hover:underline"
        >{m.footer_build_package()}</a
      >
      <a href="/docs/manifest" class="block text-gray-600 hover:underline"
        >{m.footer_manifest()}</a
      >
      <a href="/docs/contributing" class="block text-gray-600 hover:underline"
        >{m.footer_contributing()}</a
      >
      <a href="/learn" class="block text-gray-600 hover:underline">{m.footer_learn()}</a
      >
      <a href="/verify" class="block text-gray-600 hover:underline"
        >{m.footer_check_credential()}</a
      >
    </div>

    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900">{m.footer_project()}</h3>
      <a
        href="https://github.com/Containerpak"
        class="block text-gray-600 hover:underline">GitHub</a
      >
      <a href="/announcements" class="block text-gray-600 hover:underline"
        >{m.announcements()}</a
      >
      <a href="/branding" class="block text-gray-600 hover:underline"
        >{m.footer_branding()}</a
      >
      <a href="/support" class="block text-gray-600 hover:underline"
        >{m.footer_support()}</a
      >
    </div>

    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900">{m.footer_legal()}</h3>
      <a href="/legal/terms" class="block text-gray-600 hover:underline"
        >{m.footer_terms()}</a
      >
      <a href="/legal/privacy" class="block text-gray-600 hover:underline"
        >{m.footer_privacy()}</a
      >
    </div>
  </div>

  <div
    class="border-t border-slate-200 px-6 py-6 text-center text-xs text-gray-500"
  >
    {m.footer_credit_prefix()} <a
      href="https://bromb.in/"
      class="font-medium text-gray-700 hover:underline">Mirko Brombin</a
    >, {m.footer_credit_suffix({ year: String(new Date().getFullYear()) })}
  </div>
</footer>
