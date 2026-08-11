<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";

  const methods = [
    {
      name: "GitHub Sponsors",
      tag: "Recommended",
      description:
        "Support Containerpak development through GitHub with a recurring contribution.",
      href: "https://github.com/sponsors/Containerpak",
      icon: "favorite",
      primary: true,
    },
    {
      name: "PayPal",
      tag: "One-time or recurring",
      description:
        "Contribute once or set up a recurring donation through PayPal.",
      href: "https://www.paypal.com/donate?hosted_button_id=HM2VKUH5STU4J",
      icon: "payments",
    },
    {
      name: "Patreon",
      tag: "Monthly",
      description:
        "Back Mirko Brombin and the open projects he maintains each month.",
      href: "https://www.patreon.com/MirkoBrombin",
      icon: "calendar_month",
    },
    {
      name: "Bank transfer",
      tag: "Direct",
      description:
        "Use the direct account details below when platforms are not a good fit.",
      href: "#bank",
      icon: "account_balance",
    },
  ];

  const crypto = [
    {
      name: "Bitcoin",
      network: "BTC SegWit",
      value: "bc1qaujs7f50uutxrr9nh92hr3n7nkl76lltncgdmj",
    },
    {
      name: "Ethereum",
      network: "ERC20",
      value: "0x20D27496EC8e1d85c0b5A0bF8fbAE8cBd826F9e6",
    },
    {
      name: "Litecoin",
      network: "LTC",
      value: "ltc1qy8tz3gd52j68lzuy3nlr72ngt3wv09ffsf3q2l",
    },
    {
      name: "Ripple",
      network: "XRP, memo 770863059",
      value: "rLNmmcNEizWaygypRVTKaWoZG6RrqfsJpi",
    },
  ];
</script>

<svelte:head>
  <title>Support Cpak</title>
  <meta
    name="description"
    content="Fund independent development of Cpak and its application ecosystem."
  />
</svelte:head>

<Header />

<main class="bg-slate-50">
  <section class="border-b border-slate-200 bg-white">
    <div class="mx-auto max-w-7xl px-6 py-24 text-center">
      <p class="text-sm font-semibold tracking-wide text-[#4670EC] uppercase">
        Independent software
      </p>
      <h1
        class="mx-auto mt-4 max-w-4xl text-5xl font-extrabold tracking-tight text-gray-950 sm:text-6xl"
      >
        Help Cpak grow past the experiment.
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
        Cpak, its runtime, official packages, SDKs, Store, and compatibility
        work are maintained as an independent project. Funding buys the time
        needed to test more hardware and keep releases moving.
      </p>
    </div>
  </section>

  <section class="mx-auto max-w-7xl px-6 py-20">
    <div class="grid gap-5 md:grid-cols-2">
      {#each methods as method}
        <a
          href={method.href}
          target={method.href.startsWith("#") ? undefined : "_blank"}
          rel={method.href.startsWith("#") ? undefined : "noopener noreferrer"}
          class="group rounded-3xl border p-7 transition hover:-translate-y-0.5 hover:shadow-lg {method.primary
            ? 'border-[#4670EC]/30 bg-[#4670EC] text-white'
            : 'border-slate-200 bg-white text-gray-950'}"
        >
          <div class="flex items-start justify-between gap-5">
            <span
              class="material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-2xl {method.primary
                ? 'bg-white/15'
                : 'bg-[#4670EC]/10 text-[#4670EC]'}">{method.icon}</span
            >
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold {method.primary
                ? 'bg-white/15'
                : 'bg-slate-100 text-slate-600'}">{method.tag}</span
            >
          </div>
          <h2 class="mt-7 text-2xl font-bold">{method.name}</h2>
          <p
            class="mt-3 leading-7 {method.primary
              ? 'text-blue-50'
              : 'text-gray-600'}"
          >
            {method.description}
          </p>
          <span
            class="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
          >
            Open {method.name}
            <span
              class="material-symbols-outlined text-lg transition group-hover:translate-x-1"
              >arrow_forward</span
            >
          </span>
        </a>
      {/each}
    </div>
  </section>

  <section class="border-y border-slate-200 bg-white">
    <div class="mx-auto max-w-7xl px-6 py-20">
      <div class="max-w-3xl">
        <p class="text-sm font-semibold tracking-wide text-[#4670EC] uppercase">
          What support pays for
        </p>
        <h2 class="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          The work behind a package that simply opens.
        </h2>
        <p class="mt-5 text-lg leading-8 text-gray-600">
          A Cpak release is more than the command itself. It includes kernel
          compatibility, runtime isolation, package recipes, application
          testing, documentation, and maintenance of shared images across
          architectures.
        </p>
      </div>
      <div class="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 class="font-semibold text-gray-950">Compatibility lab</h3>
          <p class="mt-2 text-sm leading-6 text-gray-600">
            GPUs, display servers, distributions, kernels, init systems, and
            real desktop applications.
          </p>
        </div>
        <div>
          <h3 class="font-semibold text-gray-950">Core runtime</h3>
          <p class="mt-2 text-sm leading-6 text-gray-600">
            Store transactions, sandbox boundaries, brokers, updates, rollback,
            and recovery.
          </p>
        </div>
        <div>
          <h3 class="font-semibold text-gray-950">Official packages</h3>
          <p class="mt-2 text-sm leading-6 text-gray-600">
            Current images, dependency work, multiarch CI, SDKs, icons, and
            desktop integration.
          </p>
        </div>
        <div>
          <h3 class="font-semibold text-gray-950">Developer access</h3>
          <p class="mt-2 text-sm leading-6 text-gray-600">
            Documentation, examples, schemas, diagnostics, and a Store that can
            be understood before install.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section
    id="bank"
    class="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2"
  >
    <div>
      <p class="text-sm font-semibold tracking-wide text-[#4670EC] uppercase">
        Direct transfer
      </p>
      <h2 class="mt-3 text-3xl font-bold text-gray-950">Bank details</h2>
      <div class="mt-7 rounded-3xl border border-slate-200 bg-white p-7">
        <dl class="space-y-5">
          <div>
            <dt
              class="text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Account holder
            </dt>
            <dd class="mt-1 font-mono text-sm text-gray-950">Mirko Brombin</dd>
          </div>
          <div>
            <dt
              class="text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              IBAN
            </dt>
            <dd class="mt-1 break-all font-mono text-sm text-gray-950">
              LT50 3250 0948 5804 5072
            </dd>
          </div>
          <div>
            <dt
              class="text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              BIC / SWIFT
            </dt>
            <dd class="mt-1 font-mono text-sm text-gray-950">REVOLT21</dd>
          </div>
        </dl>
      </div>
    </div>

    <div>
      <p class="text-sm font-semibold tracking-wide text-[#4670EC] uppercase">
        Crypto
      </p>
      <h2 class="mt-3 text-3xl font-bold text-gray-950">Verified addresses</h2>
      <div
        class="mt-7 divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white"
      >
        {#each crypto as coin}
          <div class="p-5">
            <div class="flex items-baseline justify-between gap-3">
              <span class="font-semibold text-gray-950">{coin.name}</span><span
                class="text-xs text-slate-500">{coin.network}</span
              >
            </div>
            <code class="mt-2 block break-all text-xs text-slate-600"
              >{coin.value}</code
            >
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="bg-slate-950 text-white">
    <div
      class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center"
    >
      <div>
        <h2 class="text-3xl font-bold">Company sponsorship</h2>
        <p class="mt-3 max-w-2xl leading-7 text-slate-300">
          Support testing and development as a company and discuss how your
          organization can appear on the project website.
        </p>
      </div>
      <a
        href="mailto:brombin94@gmail.com?subject=Cpak%20sponsorship"
        class="shrink-0 rounded-full bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-100"
        >Get in touch</a
      >
    </div>
  </section>
</main>

<Footer />
