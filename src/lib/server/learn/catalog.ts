import type { Course, Lesson } from "$lib/learn/course";
import { localizeLearn } from "$lib/server/learn/localize";

export type CourseRecord = {
  course: Course;
  description: string;
  summary: string;
  audience: string;
  exam: { id: string; title: string } | null;
  card: {
    eyebrow: string;
    title: string;
    sentence: string;
    action: string;
    icon: string;
    art: string;
  };
};

export type LessonRecord = {
  course: Course;
  lesson: Lesson;
  description: string;
  markdown: string;
  quiz: string | null;
  playground?: "permissions" | "filesystem" | "ceiling" | "desktop-entry";
  playgroundWideOnly?: boolean;
};

const CONTENT = import.meta.glob("/src/content/learn/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const LOCALIZED_CONTENT = import.meta.glob(
  "/src/content/learn-localized/{es,it}/**/*.md",
  {
    eager: true,
    import: "default",
    query: "?raw",
  },
) as Record<string, string>;

export const COURSES = [
  {
    course: {
      slug: "start",
      title: "Start here",
      minutes: 25,
      href: "/learn/start",
      modules: [
        {
          title: "What cpak is",
          lessons: [
            {
              slug: "what-cpak-is",
              title: "An application that starts with nothing",
              href: "/learn/start/what-cpak-is",
            },
            {
              slug: "installing-something",
              title: "Installing something",
              href: "/learn/start/installing-something",
            },
          ],
        },
        {
          title: "What an application may do",
          lessons: [
            {
              slug: "nothing-is-granted",
              title: "Nothing is granted unless the manifest asks",
              href: "/learn/start/nothing-is-granted",
            },
            {
              slug: "a-ceiling-never-grants",
              title: "Overrides and managed limits",
              href: "/learn/start/a-ceiling-never-grants",
            },
          ],
        },
        {
          title: "Check what you know",
          lessons: [
            {
              slug: "check-what-you-know",
              title: "Six questions",
              href: "/learn/start/check-what-you-know",
              kind: "test",
            },
          ],
        },
      ],
    },
    description:
      "A short course on cpak for somebody who has never used it: what it is, what installing something looks like, and what an application is allowed to do afterwards.",
    summary:
      "cpak installs applications that start with nothing and get only what they asked for in writing. This course is what that means in practice: what you are shown before you install, what a permission really opens, and who can take one away.",
    audience:
      "No prior knowledge. If you have never installed anything with cpak, this is the right place to begin.",
    exam: null,
    card: {
      eyebrow: "New to cpak",
      title: "Start here",
      sentence:
        "Understand what cpak changes before installing your first application, then see what a permission actually opens.",
      action: "Start the course",
      icon: "deployed_code",
      art: "course-start",
    },
  },
  {
    course: {
      slug: "packaging",
      title: "Packaging an application",
      minutes: 65,
      href: "/learn/packaging",
      modules: [
        {
          title: "What you are shipping",
          lessons: [
            {
              slug: "what-a-package-is",
              title: "An image, a manifest, and an address",
              href: "/learn/packaging/what-a-package-is",
            },
            {
              slug: "building-the-image",
              title: "Build the runtime image",
              href: "/learn/packaging/building-the-image",
            },
          ],
        },
        {
          title: "What to ask for",
          lessons: [
            {
              slug: "asking-for-a-directory",
              title: "Asking for a directory",
              href: "/learn/packaging/asking-for-a-directory",
            },
            {
              slug: "shipping-a-desktop-entry",
              title: "Shipping a desktop entry",
              href: "/learn/packaging/shipping-a-desktop-entry",
            },
          ],
        },
        {
          title: "Deliver the application",
          lessons: [
            {
              slug: "runtime-source-or-image",
              title: "Choose image or runtime source",
              href: "/learn/packaging/runtime-source-or-image",
            },
            {
              slug: "dependencies-and-addons",
              title: "Choose dependencies and addons",
              href: "/learn/packaging/dependencies-and-addons",
            },
          ],
        },
        {
          title: "Publish and verify",
          lessons: [
            {
              slug: "publishing-a-release",
              title: "Publish a reproducible release",
              href: "/learn/packaging/publishing-a-release",
            },
          ],
        },
        {
          title: "Check what you know",
          lessons: [
            {
              slug: "check-what-you-know",
              title: "Eight questions",
              href: "/learn/packaging/check-what-you-know",
              kind: "test",
            },
          ],
        },
      ],
    },
    description:
      "A course for somebody publishing a cpak package: what a package is made of, how to ask for the access your program needs without asking for more, and how to ship a desktop entry that survives being exported.",
    summary:
      "What you publish is an image, a manifest and the address people install from. This course is about the manifest: how to ask for the access your program needs, how to ask for less than the obvious answer, and what cpak does to the desktop entry you ship.",
    audience:
      "For somebody who is going to publish a package. It assumes you know what cpak is; if you do not, start with the first course.",
    exam: {
      id: "packager",
      title: "cpak Packager",
    },
    card: {
      eyebrow: "Package authors",
      title: "Packaging an application",
      sentence:
        "Build the image, write the manifest, ask for the right access and publish a package people can inspect before installing.",
      action: "Start the course",
      icon: "inventory_2",
      art: "course-package",
    },
  },
  {
    course: {
      slug: "administration",
      title: "Running cpak on machines you look after",
      minutes: 35,
      href: "/learn/administration",
      modules: [
        {
          title: "What you decide",
          lessons: [
            {
              slug: "what-you-decide",
              title: "What you decide, and what you do not",
              href: "/learn/administration/what-you-decide",
            },
          ],
        },
        {
          title: "Setting the policy",
          lessons: [
            {
              slug: "writing-a-ceiling",
              title: "Writing a ceiling",
              href: "/learn/administration/writing-a-ceiling",
            },
          ],
        },
        {
          title: "Who you install from",
          lessons: [
            {
              slug: "requiring-a-signature",
              title: "Requiring a signature",
              href: "/learn/administration/requiring-a-signature",
            },
          ],
        },
        {
          title: "When something is refused",
          lessons: [
            {
              slug: "reading-a-refusal",
              title: "Reading a refusal",
              href: "/learn/administration/reading-a-refusal",
            },
          ],
        },
        {
          title: "Check what you know",
          lessons: [
            {
              slug: "check-what-you-know",
              title: "Eight questions",
              href: "/learn/administration/check-what-you-know",
              kind: "test",
            },
          ],
        },
      ],
    },
    description:
      "A course for whoever administers machines other people install on: what you can decide, how a ceiling narrows every installation on the host, and how to read what survives it.",
    summary:
      "Installations here belong to the people who made them, and you do not own them. What you own is the machine, and cpak gives you two decisions over it: the widest policy anything may run under, and whether a launch has to match what was recorded when it was installed.",
    audience:
      "For whoever looks after machines other people install on. It assumes you know what a permission is; if you do not, start with the first course.",
    exam: {
      id: "administrator",
      title: "cpak Administrator",
    },
    card: {
      eyebrow: "Administrators",
      title: "Running cpak on managed machines",
      sentence:
        "Set the limits of a host, decide who may publish to it and read why an application was refused.",
      action: "Start the course",
      icon: "policy",
      art: "course-admin",
    },
  },
  {
    course: {
      slug: "engineering",
      title: "Engineering cpak integrations",
      minutes: 125,
      href: "/learn/engineering",
      modules: [
        {
          title: "Follow the runtime",
          lessons: [
            {
              slug: "following-a-launch",
              title: "Follow one launch",
              href: "/learn/engineering/following-a-launch",
            },
            {
              slug: "sandbox-boundaries",
              title: "Build the sandbox in layers",
              href: "/learn/engineering/sandbox-boundaries",
            },
            {
              slug: "persistent-services",
              title: "Keep an application service running",
              href: "/learn/engineering/persistent-services",
            },
          ],
        },
        {
          title: "Cross the host boundary",
          lessons: [
            {
              slug: "typed-host-actions",
              title: "Design a typed host action",
              href: "/learn/engineering/typed-host-actions",
            },
            {
              slug: "sessions-and-nested-runs",
              title: "Cross boundaries without losing identity",
              href: "/learn/engineering/sessions-and-nested-runs",
            },
          ],
        },
        {
          title: "Extend storage and delivery",
          lessons: [
            {
              slug: "writing-a-storage-driver",
              title: "Implement a storage driver",
              href: "/learn/engineering/writing-a-storage-driver",
            },
            {
              slug: "runtime-sources",
              title: "Fetch a vendor payload safely",
              href: "/learn/engineering/runtime-sources",
            },
            {
              slug: "integrity-and-recovery",
              title: "Keep updates and launches verifiable",
              href: "/learn/engineering/integrity-and-recovery",
            },
          ],
        },
        {
          title: "Compose optional capabilities",
          lessons: [
            {
              slug: "addons-and-provider-slots",
              title: "Model addons with provider slots",
              href: "/learn/engineering/addons-and-provider-slots",
            },
          ],
        },
        {
          title: "Check what you know",
          lessons: [
            {
              slug: "check-what-you-know",
              title: "Eleven questions",
              href: "/learn/engineering/check-what-you-know",
              kind: "test",
            },
          ],
        },
      ],
    },
    description:
      "Trace a cpak launch, operate persistent services, understand its sandbox, design typed host actions, implement storage drivers, verify runtime sources and compose addon provider slots.",
    summary:
      "Trace a launch until every boundary is visible, operate it as a persistent service, then extend cpak without replacing those boundaries with arbitrary commands. The course covers sandbox construction, typed host actions, the storage driver protocol, verified runtime sources and addon provider slots.",
    audience:
      "For developers integrating a package, runtime or storage backend. You should already know how a cpak manifest describes an application.",
    exam: {
      id: "developer",
      title: "cpak Developer",
    },
    card: {
      eyebrow: "Developers",
      title: "Engineering cpak integrations",
      sentence:
        "Trace the runtime, operate persistent services, design typed host operations, implement storage drivers and compose optional providers without widening the sandbox.",
      action: "Start the course",
      icon: "developer_board",
      art: "course-engineering",
    },
  },
] satisfies CourseRecord[];

const LESSONS: Record<
  string,
  {
    description: string;
    content: string | null;
    quiz: string | null;
    playground?: LessonRecord["playground"];
    playgroundWideOnly?: boolean;
  }
> = {
  "start/what-cpak-is": {
    description:
      "The first lesson: what cpak is, what it installs, and why an application you install with it cannot read the rest of your files.",
    content: "/src/content/learn/start/what-cpak-is.md",
    quiz: null,
  },
  "start/installing-something": {
    description:
      "What you are shown before an application is installed, what the prompt is asking you to agree to, and how to answer it.",
    content: "/src/content/learn/start/installing-something.md",
    quiz: null,
  },
  "start/nothing-is-granted": {
    description:
      "The first lesson on cpak permissions: a package reaches the display, the bus, audio or the network only by naming each of them, and the playground beside the text shows the paths each name binds.",
    content: "/src/content/learn/start/nothing-is-granted.md",
    quiz: null,
    playground: "permissions",
  },
  "start/a-ceiling-never-grants": {
    description:
      "How local overrides replace manifest defaults, how an administrator ceiling limits managed machines and why nested packages cannot exceed their parent.",
    content: "/src/content/learn/start/a-ceiling-never-grants.md",
    quiz: null,
    playground: "ceiling",
  },
  "start/check-what-you-know": {
    description:
      "Six questions on the cpak course: what an ordinary install can reach, what a manifest that says nothing grants, what one permission opens and how local and managed policy interact.",
    content: null,
    quiz: "start",
    playground: "permissions",
    playgroundWideOnly: true,
  },
  "packaging/what-a-package-is": {
    description:
      "What a cpak package is made of, why the manifest exists, and why the address you publish under is the only name your package has.",
    content: "/src/content/learn/packaging/what-a-package-is.md",
    quiz: null,
  },
  "packaging/building-the-image": {
    description:
      "Choose a maintained cpak platform, separate build and runtime stages, keep translations and verify every published architecture.",
    content: "/src/content/learn/packaging/building-the-image.md",
    quiz: null,
  },
  "packaging/asking-for-a-directory": {
    description:
      "How a cpak manifest asks for filesystem access: the scopes a path can be written in, why read-only is the honest default, and what each entry lands as on the machine that installs it.",
    content: "/src/content/learn/packaging/asking-for-a-directory.md",
    quiz: null,
    playground: "filesystem",
  },
  "packaging/shipping-a-desktop-entry": {
    description:
      "What cpak does to the .desktop file your image ships: which lines it rewrites, why it rewrites every spelling of Exec, and the one thing it will not invent for you.",
    content: "/src/content/learn/packaging/shipping-a-desktop-entry.md",
    quiz: null,
    playground: "desktop-entry",
  },
  "packaging/runtime-source-or-image": {
    description:
      "Decide whether the application payload belongs in the OCI image or must be fetched from its vendor during installation.",
    content: "/src/content/learn/packaging/runtime-source-or-image.md",
    quiz: null,
  },
  "packaging/dependencies-and-addons": {
    description:
      "Choose nested dependencies, layer dependencies or optional addons according to the runtime relationship the parent actually needs.",
    content: "/src/content/learn/packaging/dependencies-and-addons.md",
    quiz: null,
  },
  "packaging/publishing-a-release": {
    description:
      "Publish a cpak package with immutable image references, checksums, provenance and a Store guide tied to the selected source revision.",
    content: "/src/content/learn/packaging/publishing-a-release.md",
    quiz: null,
  },
  "packaging/check-what-you-know": {
    description:
      "Five questions on packaging with cpak: which filesystem entries to ask for, why a user directory is written by name, and what cpak does to the desktop entry you ship.",
    content: null,
    quiz: "packaging",
  },
  "administration/what-you-decide": {
    description:
      "What an administrator can decide about cpak on a machine they look after: how wide anything may run, whether a launch has to match what was recorded, and whose software the host takes at all.",
    content: "/src/content/learn/administration/what-you-decide.md",
    quiz: null,
  },
  "administration/writing-a-ceiling": {
    description:
      "How to write a cpak ceiling: what a key you leave out means, why writing true grants nothing, why naming one permission holds the others that reach the same thing, and how to read what survives.",
    content: "/src/content/learn/administration/writing-a-ceiling.md",
    quiz: null,
    playground: "ceiling",
  },
  "administration/requiring-a-signature": {
    description:
      "The third decision an administrator makes: whether this host enrols a package nobody signed, and which publishers it will take one from.",
    content: "/src/content/learn/administration/requiring-a-signature.md",
    quiz: null,
  },
  "administration/reading-a-refusal": {
    description:
      "What to do when cpak refuses: how to see what is in force on a host, why one package is being held, and how to give up what a removal left behind.",
    content: "/src/content/learn/administration/reading-a-refusal.md",
    quiz: null,
  },
  "administration/check-what-you-know": {
    description:
      "Eight questions on ceilings, verified launch, signature policy, trust, revocation and retained removal anchors.",
    content: null,
    quiz: "administration",
  },
  "engineering/following-a-launch": {
    description:
      "Trace a cpak launch through source resolution, effective policy, layer composition, storage preparation and the final process boundary.",
    content: "/src/content/learn/engineering/following-a-launch.md",
    quiz: null,
  },
  "engineering/sandbox-boundaries": {
    description:
      "Understand what namespaces, mount policy, Landlock, seccomp and no_new_privs each contribute to a cpak sandbox.",
    content: "/src/content/learn/engineering/sandbox-boundaries.md",
    quiz: null,
  },
  "engineering/persistent-services": {
    description:
      "Declare an application command, keep it running through a portable boot adapter, pass deployment configuration safely and inspect its health.",
    content: "/src/content/learn/engineering/persistent-services.md",
    quiz: null,
  },
  "engineering/typed-host-actions": {
    description:
      "Design a finite broker provider, preserve command semantics through a compatibility shim and keep host operations inside package policy.",
    content: "/src/content/learn/engineering/typed-host-actions.md",
    quiz: null,
  },
  "engineering/sessions-and-nested-runs": {
    description:
      "Keep package identity and policy intact across nested package requests, desktop sessions and the privileged system authority.",
    content: "/src/content/learn/engineering/sessions-and-nested-runs.md",
    quiz: null,
  },
  "engineering/writing-a-storage-driver": {
    description:
      "Implement the cpak storage protocol, publish native layer checkouts atomically and satisfy the driver conformance contract.",
    content: "/src/content/learn/engineering/writing-a-storage-driver.md",
    quiz: null,
  },
  "engineering/runtime-sources": {
    description:
      "Use runtime sources for software that must be downloaded from its vendor, with an exact artifact identity and a staged install.",
    content: "/src/content/learn/engineering/runtime-sources.md",
    quiz: null,
  },
  "engineering/integrity-and-recovery": {
    description:
      "Follow cpak integrity from OCI descriptors through atomic updates, verified launch and rollback without confusing unknown state with tampering.",
    content: "/src/content/learn/engineering/integrity-and-recovery.md",
    quiz: null,
  },
  "engineering/addons-and-provider-slots": {
    description:
      "Choose nested, layer or optional composition, then use provider slots to resolve interchangeable SDKs and multi-provider capabilities.",
    content: "/src/content/learn/engineering/addons-and-provider-slots.md",
    quiz: null,
  },
  "engineering/check-what-you-know": {
    description:
      "Eleven questions on cpak launch boundaries, persistent services, typed host actions, nested packages, storage drivers, runtime sources, integrity and addon provider slots.",
    content: null,
    quiz: "engineering",
  },
};

export function findCourse(
  slug: string,
  locale: "en" | "es" | "it" = "en",
): CourseRecord | null {
  const course = COURSES.find((entry) => entry.course.slug === slug);
  return course ? localizeLearn(course, locale) : null;
}

export function findLesson(
  courseSlug: string,
  lessonSlug: string,
  locale: "en" | "es" | "it" = "en",
): LessonRecord | null {
  const held = findCourse(courseSlug, locale);
  if (!held) return null;
  const lesson = held.course.modules
    .flatMap((module) => module.lessons)
    .find((entry) => entry.slug === lessonSlug);
  if (!lesson) return null;
  const detail = LESSONS[`${courseSlug}/${lessonSlug}`];
  if (!detail) return null;
  return {
    course: held.course,
    lesson,
    description: localizeLearn(detail.description, locale),
    markdown: detail.content
      ? locale === "en"
        ? (CONTENT[detail.content] ?? "")
        : (LOCALIZED_CONTENT[
            detail.content.replace(
              "/src/content/learn/",
              `/src/content/learn-localized/${locale}/`,
            )
          ] ??
          CONTENT[detail.content] ??
          "")
      : "",
    quiz: detail.quiz,
    playground: detail.playground,
    playgroundWideOnly: detail.playgroundWideOnly,
  };
}
