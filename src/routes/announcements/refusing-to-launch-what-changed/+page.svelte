<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
  <title>Refusing to launch what changed - cpak</title>
  <meta
    name="description"
    content="cpak 2.6 records what an application is when you install it and refuses to start it when the store no longer holds that."
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
      cpak 2.6
    </p>
    <h1
      class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
    >
      Refusing to launch what changed
    </h1>
    <p class="mt-6 text-xl leading-8 text-gray-600">
      cpak now records what an application is when you install it, and refuses
      to start it when the store no longer holds that.
    </p>

    <div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
      <p>
        The sandbox has always answered one question: what a running application
        may reach. It never answered the other one. An installed application is
        a set of layers, a configuration and a permission set, and all of it
        lives in a store the user owns. Anything running as that user can edit
        it. A package with read-write access to the home can edit another
        package's layers, rewrite the permissions it runs with, and replace the
        launcher that would have checked. Nothing noticed, because nothing was
        looking.
      </p>
      <p>
        cpak 2.6 writes down what an application is and checks it before every
        launch. The check has two halves and they are deliberately separate. One
        covers what the application is: its origin, its image, the ordered list
        of its layers and the store state each one produced, its binaries,
        desktop entries and sessions. The other covers what it is allowed to do:
        the permission set after the manifest and any override you applied. The
        two are combined into the value a launch is compared against.
      </p>
      <p>
        Keeping them apart is not tidiness. It is what lets you narrow an
        application's permissions without reinstalling it, and what stops an
        update from quietly changing what an application may do while it changes
        what the application is.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        The expectation lives where you cannot write it
      </h2>
      <p>
        Every other file a launch depends on belongs to the user, so a
        comparison between two files the user owns proves nothing. The record
        therefore lives under <code>/var/lib/cpak/integrity</code>, owned by
        root, one entry per user and origin, written through the same privileged
        service that registers login sessions. The account that starts an
        application cannot rewrite what that application is supposed to be.
      </p>
      <p>
        Installing an application records it. Updating it records it again.
        Changing its permissions with <code>cpak override</code>, or enabling an
        addon, records it again as part of the same command: a narrower
        permission set goes through without asking, a wider one asks for an
        administrator password once. That is the same rule a permission manager
        already follows, applied to the thing that decides whether the
        application starts.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        What is refused, and when
      </h2>
      <p>
        There is a level, and it governs exactly one thing: what happens to an
        application nobody has recorded. Off is the default and behaves as cpak
        did before. Warn refuses nothing and reports every disagreement, so a
        machine can be watched before anything is enforced. Refuse turns those
        into refusals.
      </p>
      <p>
        A store that contradicts itself is a different matter and is refused at
        every level, including off. If a layer binding names a state the store
        no longer serves, or a prepared checkout is not the shape its recorded
        state describes, that is not an unknown, it is a disagreement inside the
        store, and there is no level at which it should start. Enforcement
        governs the unknown, never the known bad.
      </p>
      <p>
        An installation made before this release has nothing recorded. It keeps
        working, it is reported by <code>cpak audit</code>, and
        <code>cpak audit --backfill-bindings</code> brings it up to date without
        reinstalling. When a launch is refused,
        <code>cpak system explain</code> puts what is recorded beside what the launch
        derives, so the disagreement can be read instead of guessed.
      </p>

      <h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
        What this does not claim
      </h2>
      <p>
        Recording happens at install time, from what is on disk at that moment.
        That is a true statement about a machine whose owner is trusted, and it
        is the right guarantee for a desktop: one application can no longer
        change another, or its permissions, or the code that checks, without the
        next launch refusing. It is not authenticity. It does not prove a
        package came from its author, and nothing here pretends otherwise.
        Publisher signing is what makes that claim, and it is the next piece.
      </p>
      <p>
        The comparison at launch is metadata: paths, kinds, sizes, permission
        bits and link targets. File contents are not read, because reading every
        byte of a large application costs seconds and a launch cannot pay that.
        Content is checked on demand instead. And on a machine whose owner is
        hostile to themselves, none of this holds, because they can simply not
        use it. Where the person at the keyboard does not control root, it holds
        completely.
      </p>
      <p>
        Read the <a
          class="font-semibold text-[#3E7BFF]"
          href="/docs/verified-launch">verified launch guide</a
        >
        for the levels, the commands and the exact shape of the guarantee, or the
        <a class="font-semibold text-[#3E7BFF]" href="/docs/sandbox"
          >sandbox guide</a
        > for the boundary a running application works inside.
      </p>
    </div>

    <a
      href="https://github.com/Containerpak/cpak/releases/tag/v2.6.0"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-14 inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
    >
      View cpak 2.6
      <span class="material-symbols-outlined">open_in_new</span>
    </a>
  </article>
</main>

<Footer />
