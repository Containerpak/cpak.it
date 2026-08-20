import { orderOf, placements, shuffled } from "$lib/learn/shuffle";

export type ExamQuestion = {
  asks: string;
  choices: string[];
  correct: number;
};

export type Exam = {
  id: string;
  title: string;
  credential: string;
  course: { title: string; href: string };
  pass: number;
  questions: ExamQuestion[];
};

const PASS = 0.8;

export const EXAMS: Record<string, Exam> = {
  packager: {
    id: "packager",
    title: "cpak Packager",
    credential: "cpak Packager",
    course: {
      title: "Packaging an application",
      href: "/learn/packaging",
    },
    pass: PASS,
    questions: [
      {
        asks: "A photo editor opens files a person picks and saves settings of its own. Which filesystem list does its manifest carry?",
        choices: [
          "home, read-write",
          "xdg-pictures read-write, and home/.config/<app> read-write",
          "host read-only",
          "home read-only, and xdg-pictures read-write",
        ],
        correct: 1,
      },
      {
        asks: "Why is a user directory written as xdg-documents rather than home/Documents?",
        choices: [
          "They are the same, and the short form is conventional",
          "home/Documents is read-only and the xdg form is not",
          "It resolves against whatever that person's desktop has that directory set to",
          "The xdg form survives the manifest migration and the other does not",
        ],
        correct: 2,
      },
      {
        asks: "A .desktop file in your image sets Exec three times with different leading whitespace. What does cpak rewrite?",
        choices: [
          "The first, because a launcher reads top to bottom",
          "The last, because that is the one a launcher keeps",
          "All three",
          "None, and the export is refused",
        ],
        correct: 2,
      },
      {
        asks: "The same file also has a line reading Exec[de]=... . What happens to it?",
        choices: [
          "It is rewritten, because it sets Exec",
          "It is left alone, because it is a different key",
          "It is deleted, because cpak exports one locale",
          "It makes the export fail",
        ],
        correct: 1,
      },
      {
        asks: "Your manifest asks for nothing at all. What can the application reach?",
        choices: [
          "Whatever the person installing it allows at the prompt",
          "The display and the session bus, which every application gets",
          "Its own image, and nothing else on the machine",
          "The home directory, read-only",
        ],
        correct: 2,
      },
      {
        asks: "A user runs cpak override --network=false on your package. What happens?",
        choices: [
          "Nothing: an override cannot narrow what the manifest asked for",
          "The application runs without the network, and can be given it back later",
          "The install is refused until the manifest is changed",
          "The package is re-fetched with a different manifest",
        ],
        correct: 1,
      },
      {
        asks: "Which of these is not a grant cpak can express, and would be dropped with a warning?",
        choices: [
          "/opt/data",
          "xdg-download",
          "home/.local/share/example",
          "~/Documents",
        ],
        correct: 3,
      },
      {
        asks: "You are unsure whether your program needs a directory. What belongs in the manifest you publish?",
        choices: [
          "The directory, since removing it later breaks people",
          "home, so the question stops coming up",
          "Nothing, and the entry is added when somebody reports what broke",
          "The directory, read-only, as a compromise",
        ],
        correct: 2,
      },
      {
        asks: "What does socketX11 open, beyond a socket to draw through?",
        choices: [
          "Nothing else: it is one socket",
          "The clipboard, the keystrokes and the pixels of every other window on that display",
          "The display and the audio server, which share a socket directory",
          "The display, and the network if the session is remote",
        ],
        correct: 1,
      },
      {
        asks: "Your image ships a .desktop file with no [Desktop Entry] group. What does cpak do on export?",
        choices: [
          "It writes the group and carries on",
          "It refuses to install the package",
          "It rewrites the commands it can read and does not invent the group",
          "It exports the file unchanged",
        ],
        correct: 2,
      },
      {
        asks: "A vendor permits installation but not redistribution of its binary. Which package design respects that boundary?",
        choices: [
          "Copy the binary into a private OCI registry",
          "Declare a runtime source with the vendor HTTPS URL, exact size and SHA-256",
          "Commit the binary with Git LFS",
          "Download the latest file from the wrapper at every launch",
        ],
        correct: 1,
      },
      {
        asks: "When should a Debian runtime source use deb-extract instead of dpkg?",
        choices: [
          "When its payload is sufficient and maintainer scripts are not required",
          "Whenever the package contains a desktop entry",
          "Only when the package is built for arm64",
          "When its SHA-256 is not available",
        ],
        correct: 0,
      },
      {
        asks: "An application requires a helper command but the helper should keep its own sandbox. What relationship should the manifest use?",
        choices: [
          "An optional addon",
          "A layer dependency",
          "A nested dependency",
          "A runtime source",
        ],
        correct: 2,
      },
      {
        asks: "Why clean APT data in the same image layer that installed the runtime packages?",
        choices: [
          "cpak validates only the last layer",
          "Files removed in a later layer still occupy bytes in the earlier OCI layer",
          "The storage driver cannot deduplicate package indexes",
          "The Store rejects images containing manuals",
        ],
        correct: 1,
      },
    ],
  },

  administrator: {
    id: "administrator",
    title: "cpak Administrator",
    credential: "cpak Administrator",
    course: {
      title: "Running cpak on machines you look after",
      href: "/learn/administration",
    },
    pass: PASS,
    questions: [
      {
        asks: "Your ceiling contains \"network\": true and a package asks for nothing. What can it reach?",
        choices: [
          "The network, because the host allows it",
          "Nothing off the machine",
          "The network, for accounts that opted in",
          "It depends on the enforcement level",
        ],
        correct: 1,
      },
      {
        asks: "A key your ceiling does not name is:",
        choices: [
          "Denied, because a ceiling is a list of what is permitted",
          "Granted, because the ceiling did not object",
          "Left to the manifest and the owner of the installation",
          "Refused at install time as undeclared",
        ],
        correct: 2,
      },
      {
        asks: "Your ceiling names socketSystemBus. What happens to socketBluetooth?",
        choices: [
          "Nothing, it was not named",
          "It is held too, because it opens the same socket",
          "It is granted, to keep the bus usable",
          "The ceiling is refused as ambiguous",
        ],
        correct: 1,
      },
      {
        asks: "A package asks for the whole home read-write and your ceiling allows the home read-only. What runs?",
        choices: [
          "Nothing: the request exceeds the ceiling",
          "The application, with read-only access to the home",
          "The application, with the access it asked for and a warning",
          "The application, with no filesystem access at all",
        ],
        correct: 1,
      },
      {
        asks: "The same manifest also asks for /mnt/work, which the ceiling does not cover. What happens to that one?",
        choices: [
          "It is downgraded to read-only",
          "It is gone",
          "It is kept, because the ceiling is silent about it",
          "It makes the launch refuse",
        ],
        correct: 1,
      },
      {
        asks: "You are turning on verified launch across a fleet. What do you set first?",
        choices: [
          "refuse",
          "warn",
          "off, and set a ceiling instead",
          "refuse, on one machine, then the rest",
        ],
        correct: 1,
      },
      {
        asks: "What does enforcement decide?",
        choices: [
          "How wide any installation on the host may be",
          "Whether a launch has to match what was recorded when it was installed",
          "Which publishers a machine will install from",
          "Whether users may write their own overrides",
        ],
        correct: 1,
      },
      {
        asks: "Which of these can a ceiling do?",
        choices: [
          "Give a package access its manifest never asked for",
          "Make an unsigned package count as signed",
          "Narrow what a package and the installation owner agreed on",
          "Remove a package from another account",
        ],
        correct: 2,
      },
      {
        asks: "Setting a ceiling asks for an administrator password. When is the file read?",
        choices: [
          "After authenticating, so a bad file costs a password",
          "Before anybody is asked to authenticate",
          "At the next launch of each application",
          "Only when cpak system ceiling is run",
        ],
        correct: 1,
      },
      {
        asks: "cpak installs into a person's own home as that person. What can you do to another account's installation?",
        choices: [
          "Remove it, as the machine administrator",
          "Read what it holds with cpak list",
          "Nothing directly: what you set is the policy the host permits",
          "Re-enrol it under the fleet policy",
        ],
        correct: 2,
      },
      {
        asks: "A host requires signatures and receives an unsigned package. Which statement is accurate?",
        choices: [
          "The package is installed but left unenrolled, and enforcement handles any later launch",
          "The package is deleted before its manifest can be recorded",
          "The package runs once while the desktop asks for approval",
          "The package is enrolled under the local account identity",
        ],
        correct: 0,
      },
      {
        asks: "An approved signer entry contains only a GitHub Actions issuer and leaves the other signer fields out. What does it accept?",
        choices: [
          "Only repositories below the approved_origins list",
          "Any package signed through that issuer, unless another policy condition narrows it",
          "Only packages whose origin matches the signing workflow repository",
          "Nothing, because every signer field is mandatory",
        ],
        correct: 1,
      },
      {
        asks: "A trust policy revokes an origin without naming a generation. What is revoked?",
        choices: [
          "The currently installed generation only",
          "Every generation of that origin",
          "Future generations only",
          "The signer, across every origin",
        ],
        correct: 1,
      },
      {
        asks: "Which command changes state while diagnosing a refusal left by a removed package?",
        choices: [
          "cpak system status",
          "cpak system explain",
          "cpak system clear-removal",
          "cpak system trust",
        ],
        correct: 2,
      },
    ],
  },

  developer: {
    id: "developer",
    title: "cpak Developer",
    credential: "cpak Developer",
    course: {
      title: "Engineering cpak integrations",
      href: "/learn/engineering",
    },
    pass: PASS,
    questions: [
      {
        asks: "Which order describes the main launch decisions before the application process begins?",
        choices: [
          "Resolve package, calculate policy, compose layers, prepare the boundary",
          "Create namespaces, resolve package, ask the storage driver, calculate policy",
          "Compose layers, grant addon permissions, resolve package, start the broker",
          "Start the process, mount the image, verify the manifest, apply the ceiling",
        ],
        correct: 0,
      },
      {
        asks: "A user override removes network and the system ceiling allows it. What is the effective network policy?",
        choices: [
          "Allowed because the system ceiling has priority",
          "Allowed only for nested packages",
          "Denied because a ceiling cannot restore a removed grant",
          "Denied only when verified launch is set to refuse",
        ],
        correct: 2,
      },
      {
        asks: "Which mechanism prevents a process from gaining privilege through a setuid executable after launch setup?",
        choices: [
          "OverlayFS",
          "no_new_privs",
          "The runtime index",
          "The package lock",
        ],
        correct: 1,
      },
      {
        asks: "Why is an arbitrary command field invalid for a host action provider?",
        choices: [
          "It prevents cpak from choosing Podman or Docker",
          "It cannot preserve standard output",
          "It turns a finite policy-gated operation into general host execution",
          "It requires a system bus",
        ],
        correct: 2,
      },
      {
        asks: "A container action asks to remove a host container without the requesting package ownership label. What should the provider do?",
        choices: [
          "Remove it when manage-owned is granted",
          "Refuse it before selecting the backend operation",
          "Ask the desktop user for confirmation",
          "Forward it only to a rootless backend",
        ],
        correct: 1,
      },
      {
        asks: "What may a storage driver change while repairing a derived checkout?",
        choices: [
          "The immutable source layer",
          "The application's writable data",
          "Only rebuildable data under its assigned driver root",
          "The package manifest digest",
        ],
        correct: 2,
      },
      {
        asks: "Why must a storage driver publish a checkout atomically?",
        choices: [
          "So OverlayFS can sort the lower directories",
          "So a failed preparation never replaces the last valid checkout with a partial one",
          "So source layers can be removed immediately",
          "So the driver can run as another user",
        ],
        correct: 1,
      },
      {
        asks: "An external storage driver returns a symlink that escapes its assigned root. What happens?",
        choices: [
          "cpak follows it when the socket owner matches",
          "cpak mounts it read-only",
          "cpak rejects the returned path after symlink resolution",
          "The system ceiling decides",
        ],
        correct: 2,
      },
      {
        asks: "Which runtime source installer is the smaller boundary for a Debian package whose maintainer scripts are not needed?",
        choices: [
          "dpkg",
          "deb-extract",
          "file",
          "tar, after renaming the package",
        ],
        correct: 1,
      },
      {
        asks: "A runtime source download returns one byte more than its declared size. What happens?",
        choices: [
          "The extra byte is ignored and SHA-256 is checked",
          "The source is installed when the package is signed",
          "The download is rejected before installation",
          "The runtime source is retried without a size check",
        ],
        correct: 2,
      },
      {
        asks: "What is the correct slot mode for choosing either Go or TinyGo as the active sdk.go provider?",
        choices: [
          "multiple",
          "nested",
          "exclusive",
          "layer",
        ],
        correct: 2,
      },
      {
        asks: "A provider exports a library_path and include_path. What does that change?",
        choices: [
          "The parent receives new host filesystem permissions",
          "The provider paths join the runtime and compiler search environments",
          "The provider becomes a required dependency",
          "The Store selects it for every installed parent",
        ],
        correct: 1,
      },
      {
        asks: "A nested request claims a different parent origin from the process that opened the private socket. Which identity is authoritative?",
        choices: [
          "The origin written in the request",
          "The installed dependency's publisher",
          "The authenticated package instance bound to the connection",
          "The desktop account name",
        ],
        correct: 2,
      },
      {
        asks: "A package session declares an identifier already owned by a system session. What should registration do?",
        choices: [
          "Replace it after Polkit approval",
          "Refuse the collision",
          "Rename the system session",
          "Register both and let the display manager decide",
        ],
        correct: 1,
      },
      {
        asks: "Verified launch finds a checkout that contradicts the state bound to its layer. Enforcement is off. What happens?",
        choices: [
          "The launch starts with a warning",
          "The launch is refused as tampered",
          "The layer is enrolled again automatically",
          "The storage driver chooses whether to continue",
        ],
        correct: 1,
      },
      {
        asks: "An update fails after staging new runtime sources but before switching the active package record. Which version remains active?",
        choices: [
          "The staged version, without its exports",
          "Neither version until audit repairs the transaction",
          "The previous version",
          "Whichever version has the newer OCI digest",
        ],
        correct: 2,
      },
    ],
  },
};

const columns = new Map<string, number[]>();

function columnFor(exam: Exam, index: number): number {
  let paper = columns.get(exam.id);
  if (!paper) {
    const widest = Math.max(...exam.questions.map((q) => q.choices.length));
    paper = placements(exam.id, exam.questions.length, widest);
    columns.set(exam.id, paper);
  }
  const choices = exam.questions[index].choices.length;
  return paper[index] % choices;
}

export function asked(exam: Exam) {
  return {
    id: exam.id,
    title: exam.title,
    credential: exam.credential,
    course: exam.course,
    pass: exam.pass,
    questions: exam.questions.map((question, index) => ({
      asks: question.asks,
      choices: shuffled(
        question.asks,
        question.choices,
        question.correct,
        columnFor(exam, index),
      ),
    })),
  };
}

export type Marked = {
  right: number;
  total: number;
  share: number;
  passed: boolean;
};

export function mark(exam: Exam, given: (number | null)[]): Marked {
  const right = exam.questions.reduce((count, question, index) => {
    const shown = orderOf(
      question.asks,
      question.choices.length,
      question.correct,
      columnFor(exam, index),
    );
    const chosen = given[index];
    if (chosen === null || chosen < 0 || chosen >= shown.length) return count;
    return count + (shown[chosen] === question.correct ? 1 : 0);
  }, 0);
  const total = exam.questions.length;
  const share = total === 0 ? 0 : right / total;
  return { right, total, share, passed: share >= exam.pass };
}
