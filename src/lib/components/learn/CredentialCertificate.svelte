<script lang="ts">
  import {
    longDate,
    standing,
    standingWord,
    type Held,
  } from "$lib/learn/credential";
  import * as m from "$lib/paraglide/messages.js";

  let { held }: { held: Held } = $props();

  let certificate: SVGSVGElement;
  let state = $derived(standing(held));
  let account = $derived(
    held.provider === "github" ? `@${held.handle}` : held.handle,
  );

  function fileName(extension: string) {
    const name = held.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `${name}-${held.code.toLowerCase()}.${extension}`;
  }

  function asDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async function serialise() {
    const copy = certificate.cloneNode(true) as SVGSVGElement;
    copy.setAttribute("width", "1400");
    copy.setAttribute("height", "990");

    for (const image of copy.querySelectorAll("image")) {
      const source = image.getAttribute("href");
      if (!source || source.startsWith("data:")) continue;
      const response = await fetch(new URL(source, window.location.href));
      if (!response.ok) throw new Error(`Unable to read ${source}`);
      image.setAttribute("href", await asDataUrl(await response.blob()));
    }

    return new XMLSerializer().serializeToString(copy);
  }

  async function downloadPng() {
    const source = await serialise();
    const url = URL.createObjectURL(
      new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
    );
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 2800;
      canvas.height = 1980;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const download = document.createElement("a");
        download.href = URL.createObjectURL(blob);
        download.download = fileName("png");
        download.click();
        URL.revokeObjectURL(download.href);
      }, "image/png");
      URL.revokeObjectURL(url);
    };

    image.src = url;
  }

  function savePdf() {
    window.print();
  }
</script>

<div class="certificate-actions flex flex-wrap items-center gap-3">
  <button
    type="button"
    onclick={downloadPng}
    class="rounded-full bg-[#4670EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3158c7] focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
  >
    {m.certificate_download_png()}
  </button>
  <button
    type="button"
    onclick={savePdf}
    class="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
  >
    {m.certificate_save_pdf()}
  </button>
</div>

<div class="certificate-frame mt-6 overflow-hidden bg-white shadow-2xl">
  <svg
    bind:this={certificate}
    viewBox="0 0 1400 990"
    role="img"
    aria-label={`${held.title} certificate issued to ${account}`}
    xmlns="http://www.w3.org/2000/svg"
    class="block h-auto w-full"
  >
    <rect width="1400" height="990" fill="#F8FAFF" />
    <rect width="164" height="990" fill="#122454" />
    <rect x="28" y="28" width="1344" height="934" fill="none" stroke="#B9C9F8" stroke-width="2" />
    <rect x="42" y="42" width="1316" height="906" fill="none" stroke="#E1E8FA" stroke-width="1" />

    <image href="/cpak-brand.svg" x="220" y="100" width="181" height="80" />
    <text x="1190" y="128" text-anchor="end" fill="#3158C7" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">
      CPAK LEARN
    </text>
    <text x="1190" y="164" text-anchor="end" fill="#64748B" font-family="Arial, sans-serif" font-size="18">
      {m.certificate_achievement()}
    </text>

    <line x1="220" y1="220" x2="1190" y2="220" stroke="#CBD5E1" stroke-width="2" />

    <text x="220" y="320" fill="#64748B" font-family="Arial, sans-serif" font-size="22" letter-spacing="2">
      {m.certificate_certifies()}
    </text>
    <text x="220" y="408" fill="#0F172A" font-family="Arial, sans-serif" font-size="64" font-weight="700">
      {account}
    </text>
    <text x="220" y="468" fill="#475569" font-family="Arial, sans-serif" font-size="24">
      {m.certificate_passed()}
    </text>

    <text x="220" y="580" fill="#122454" font-family="Arial, sans-serif" font-size="50" font-weight="700" letter-spacing="1">
      {held.title}
    </text>
    <text x="220" y="628" fill="#475569" font-family="Arial, sans-serif" font-size="23">
      {m.certificate_result({ result: held.result })}
    </text>

    <line x1="220" y1="680" x2="1190" y2="680" stroke="#CBD5E1" stroke-width="2" />

    <text x="220" y="730" fill="#64748B" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2">{m.credential_issued_label().toUpperCase()}</text>
    <text x="220" y="766" fill="#0F172A" font-family="Arial, sans-serif" font-size="22">{longDate(held.issuedAt)}</text>
    <text x="430" y="730" fill="#64748B" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2">{m.certificate_valid_until()}</text>
    <text x="430" y="766" fill="#0F172A" font-family="Arial, sans-serif" font-size="22">{longDate(held.expiresAt)}</text>
    <text x="650" y="730" fill="#64748B" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2">{m.certificate_status()}</text>
    <text x="650" y="766" fill="#3158C7" font-family="Arial, sans-serif" font-size="22" font-weight="700">{standingWord(state)}</text>
    <text x="220" y="825" fill="#64748B" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2">{m.certificate_credential_code()}</text>
    <text x="220" y="861" fill="#0F172A" font-family="monospace" font-size="21">{held.code}</text>

    <text x="220" y="912" fill="#64748B" font-family="Arial, sans-serif" font-size="17">
      {m.certificate_verify_at({ code: held.code })}
    </text>

    <image
      href="/learn/mirko-brombin-signature.svg"
      x="855"
      y="755"
      width="280"
      height="113"
    />
    <text x="995" y="892" text-anchor="middle" fill="#0F172A" font-family="Arial, sans-serif" font-size="18" font-weight="700">
      Mirko Brombin
    </text>
    <text x="995" y="918" text-anchor="middle" fill="#64748B" font-family="Arial, sans-serif" font-size="16">
      {m.certificate_signature_role()}
    </text>
  </svg>
</div>

<p class="certificate-note mt-4 text-sm leading-6 text-gray-600">
  {m.certificate_note()}
</p>

<style>
  @media print {
    :global(header),
    :global(footer),
    .certificate-actions,
    .certificate-note,
    :global(.certificate-heading) {
      display: none !important;
    }

    :global(main) {
      background: white !important;
    }

    :global(.certificate-page) {
      max-width: none !important;
      padding: 0 !important;
    }

    .certificate-frame {
      margin: 0 !important;
      box-shadow: none !important;
    }

    @page {
      size: A4 landscape;
      margin: 0;
    }
  }
</style>
