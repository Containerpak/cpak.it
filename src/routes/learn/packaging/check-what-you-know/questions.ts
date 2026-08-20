import type { Question } from "$lib/components/learn/Quiz.svelte";

export const QUESTIONS: Question[] = [
  {
    asks: "Your photo editor opens files a person picks, and saves settings of its own. What does the manifest ask for?",
    choices: [
      {
        text: "home, read-write",
        why: "That is every document, every download and every dot-directory, including the one holding a browser session. It always works, which is why it is the most over-asked grant there is.",
      },
      {
        text: "xdg-pictures read-write, and home/.config/fotoritocco read-write",
        correct: true,
        why: "One user directory for the files a person opens, one path of its own for settings. Two entries, and nothing else is reachable.",
      },
      {
        text: "host, read-only, so it can open a photo from anywhere",
        why: "Read-only on the whole machine is still the whole machine, and it cannot save. It is a wider grant that does less.",
      },
    ],
  },
  {
    asks: "Why write xdg-pictures rather than home/Pictures?",
    choices: [
      {
        text: "They are the same thing, and the short one is tidier",
        why: "Not on a machine whose desktop is not in English. home/Pictures is a directory that may not exist there.",
      },
      {
        text: "It resolves against whatever that person's desktop has the pictures directory set to",
        correct: true,
        why: "Immagini, Bilder, or a path somebody moved. The name travels; the literal path does not.",
      },
      {
        text: "It is read-only and home/Pictures is not",
        why: "The scope and the access mode are separate. Either can be read-only or read-write.",
      },
    ],
  },
  {
    asks: "A .desktop file in your image sets Exec three times, spelled with different whitespace. What does cpak rewrite?",
    choices: [
      {
        text: "The first one, since a launcher reads top to bottom",
        why: "A launcher keeps the last one it reads in the group, so rewriting the first is the one answer that looks handled and is not.",
      },
      {
        text: "All three",
        correct: true,
        why: "A launcher strips the whitespace and reads all three as the same key. Any one of them left alone is a command that starts your program outside the container.",
      },
      {
        text: "None, and the export is refused as ambiguous",
        why: "There is nothing ambiguous about it: the launcher's rules say exactly which one runs. cpak follows those rules rather than refusing.",
      },
    ],
  },
  {
    asks: "A line in the file reads Exec[de]=... . Is it rewritten?",
    choices: [
      {
        text: "Yes, it contains Exec and it would run",
        why: "It is a different key, for a German locale, and rewriting a line no launcher would run means quietly corrupting the file.",
      },
      {
        text: "No, it is a different key from the one the launcher runs",
        correct: true,
        why: "Nothing is rewritten that a launcher would not have run. Exec, ExecPath and a comment mentioning Exec are three different things.",
      },
      {
        text: "Only when the manifest declares a German locale",
        why: "A manifest does not declare locales, and the answer does not depend on the machine reading the file.",
      },
    ],
  },
  {
    asks: "You are not sure a directory is needed. What goes in the manifest you publish?",
    choices: [
      {
        text: "Ask for it. Removing it later breaks people who came to rely on it",
        why: "Backwards, and it is the reasoning that produces the manifests nobody trusts. An entry nobody needed is access nobody agreed to for a reason.",
      },
      {
        text: "Leave it out, and add it when somebody reports what it broke",
        correct: true,
        why: "Asking for less and gaining an entry later is a package people read and trust. The other order does not recover.",
      },
      {
        text: "Ask for home instead, so the question stops coming up",
        why: "That is the same decision made once, badly, for every directory at the same time.",
      },
    ],
  },
  {
    asks: "A vendor lets users download its editor but does not allow you to redistribute the binary. Where does the payload belong?",
    choices: [
      {
        text: "In the OCI image, because cpak does not publish a traditional package",
        why: "An OCI registry still redistributes the vendor binary.",
      },
      {
        text: "In a runtime source pinned by HTTPS URL, size and SHA-256",
        correct: true,
        why: "The user's machine downloads the original vendor artifact and cpak verifies its exact identity before installation.",
      },
      {
        text: "In the repository release as an untracked attachment",
        why: "That changes the host but not the redistribution problem, and it removes the manifest contract.",
      },
    ],
  },
  {
    asks: "An editor works without Go, but can discover a Go SDK when the user enables one. Which relationship fits?",
    choices: [
      {
        text: "A required nested dependency",
        why: "That installs Go for every editor user even when the editor works without it.",
      },
      {
        text: "An optional addon provider",
        correct: true,
        why: "The user selects it for the parent, and the provider exports its tool and compiler paths.",
      },
      {
        text: "A runtime source in the editor manifest",
        why: "A runtime source installs vendor payload for one package; it does not model an optional shared SDK package.",
      },
    ],
  },
  {
    asks: "Why run cpak-clean-junk in the same image layer as apt-get install?",
    choices: [
      {
        text: "A later cleanup layer cannot remove bytes already stored in an earlier OCI layer",
        correct: true,
        why: "The final view looks clean either way, but registries and local storage still carry bytes from every layer.",
      },
      {
        text: "cpak refuses images with more than one RUN instruction",
        why: "Layer count alone is not a manifest validation rule.",
      },
      {
        text: "It compiles the application translation catalogs",
        why: "Application catalogs stay in the package; junk cleanup removes package manager and documentation residue.",
      },
    ],
  },
];
