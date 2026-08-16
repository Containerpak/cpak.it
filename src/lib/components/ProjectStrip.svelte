<script>
  const projects = [
    {
      name: "Bottles",
      href: "https://usebottles.com/",
      lightLogo: "/projects/bottles.svg",
      darkLogo: "/projects/bottles-dark.svg",
      className: "project-logo-bottles",
    },
    {
      name: "Singularity",
      href: "https://sinty.dev/",
      lightLogo: "/projects/sinty.webp",
      darkLogo: "/projects/sinty.webp",
      className: "project-logo-sinty",
    },
    {
      name: "fabricators",
      href: "https://fabricators.ltd/",
      lightLogo: "/projects/fabricators.svg",
      darkLogo: "/projects/fabricators-dark.svg",
      className: "project-logo-fabricators",
    },
    {
      name: "Vanilla OS",
      href: "https://vanillaos.org/",
      lightLogo: "/projects/vanilla-os.svg",
      darkLogo: "/projects/vanilla-os-dark.svg",
      className: "project-logo-vanilla",
    },
    {
      name: "DaBaDee",
      href: "https://github.com/mirkobrombin/DaBaDee",
      lightLogo: "/projects/dabadee.webp",
      darkLogo: "/projects/dabadee.webp",
      className: "project-logo-dabadee",
    },
    {
      name: "FVS",
      href: "https://github.com/fvs-lab",
      lightLogo: "/projects/fvs.svg",
      darkLogo: "/projects/fvs.svg",
      className: "project-logo-fvs",
    },
    {
      name: "go-foundation",
      href: "https://github.com/mirkobrombin/go-foundation",
      lightLogo: "/projects/go-foundation.png",
      darkLogo: "/projects/go-foundation.png",
      className: "project-logo-go-foundation",
    },
    {
      name: "go-slipstream",
      href: "https://github.com/mirkobrombin/go-slipstream",
      lightLogo: "/projects/go-slipstream.webp",
      darkLogo: "/projects/go-slipstream.webp",
      className: "project-logo-go-slipstream",
    },
    {
      name: "Go",
      href: "https://go.dev/",
      lightLogo: "/projects/go-black.svg",
      darkLogo: "/projects/go-white.svg",
      className: "project-logo-go",
    },
    {
      name: "GitHub",
      href: "https://github.com/Containerpak",
      lightLogo: "/projects/github-black.svg",
      darkLogo: "/projects/github-white.svg",
      className: "project-logo-github",
    },
    {
      name: "Ubuntu",
      href: "https://ubuntu.com/",
      lightLogo: "/projects/ubuntu.svg",
      darkLogo: "/projects/ubuntu.svg",
      className: "project-logo-ubuntu",
    },
    {
      name: "Cloudflare",
      href: "https://www.cloudflare.com/",
      lightLogo: "/projects/cloudflare.png",
      darkLogo: "/projects/cloudflare-dark.png",
      className: "project-logo-cloudflare",
    },
  ];
</script>

<section
  class="project-strip bg-slate-100"
  aria-labelledby="project-strip-title"
>
  <div class="mx-auto max-w-7xl px-6 pt-12 pb-10">
    <p
      id="project-strip-title"
      class="mb-8 text-center text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase"
    >
      Projects and technologies around cpak
    </p>

    <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-10">
      {#each projects as project}
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          class="project-link flex min-h-12 w-[calc(50%-1rem)] items-center justify-center sm:w-[calc(33.333%-1.5rem)] lg:w-auto lg:flex-1"
          aria-label={`Visit ${project.name}`}
          title={`Visit ${project.name}`}
        >
          <span class={`project-logo ${project.className}`}>
            <img
              src={project.lightLogo}
              alt={project.name}
              class="project-logo-image project-logo-light"
              loading="lazy"
            />
            <img
              src={project.darkLogo}
              alt=""
              class="project-logo-image project-logo-dark"
              loading="lazy"
              aria-hidden="true"
            />
          </span>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .project-logo {
    position: relative;
    display: block;
    width: min(100%, 11rem);
    height: 2.75rem;
  }

  .project-logo-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: grayscale(1);
    opacity: 0.52;
    transition:
      filter 180ms ease,
      opacity 180ms ease,
      transform 180ms ease;
  }

  .project-logo-dark {
    display: none;
  }

  .project-link:hover .project-logo-image,
  .project-link:focus-visible .project-logo-image {
    filter: grayscale(0);
    opacity: 1;
    transform: translateY(-1px);
  }

  .project-link:focus-visible {
    border-radius: 0.5rem;
    outline: 2px solid #4670ec;
    outline-offset: 0.5rem;
  }

  .project-logo-bottles {
    width: min(100%, 9.5rem);
  }

  .project-logo-sinty {
    width: min(100%, 10rem);
  }

  .project-logo-fabricators {
    width: min(100%, 11.5rem);
  }

  .project-logo-vanilla {
    width: min(100%, 8.5rem);
  }

  .project-logo-dabadee {
    width: min(100%, 9.5rem);
  }

  .project-logo-fvs {
    width: min(100%, 2.75rem);
  }

  .project-logo-go-foundation {
    width: min(100%, 3rem);
  }

  .project-logo-go-slipstream {
    width: min(100%, 3rem);
  }

  .project-logo-go {
    width: min(100%, 4.75rem);
  }

  .project-logo-github {
    width: min(100%, 8rem);
  }

  .project-logo-ubuntu {
    width: min(100%, 2.75rem);
  }

  .project-logo-cloudflare {
    width: min(100%, 8.5rem);
  }

  :global(html[data-theme="dark"]) .project-logo-light {
    display: none;
  }

  :global(html[data-theme="dark"]) .project-logo-dark {
    display: block;
  }

  :global(html:not([data-theme="dark"])) .project-logo-sinty img {
    filter: grayscale(1) brightness(0.2);
  }

  :global(html:not([data-theme="dark"])) .project-logo-fvs img {
    filter: grayscale(1) brightness(0.35);
  }

  :global(html:not([data-theme="dark"]))
    .project-link:hover
    .project-logo-sinty
    img,
  :global(html:not([data-theme="dark"]))
    .project-link:focus-visible
    .project-logo-sinty
    img {
    filter: grayscale(0) brightness(0.45);
  }

  @media (prefers-reduced-motion: reduce) {
    .project-logo-image {
      transition: none;
    }
  }
</style>
