import type { Question } from "$lib/components/learn/Quiz.svelte";

export const QUESTIONS: Question[] = [
  {
    asks: "Your ceiling contains \"network\": true. A package asks for nothing. What can it reach?",
    choices: [
      {
        text: "The network, because the host allows it",
        why: "A ceiling never grants. Writing true says this host will not stand in the way, which is what leaving the key out already said.",
      },
      {
        text: "Nothing off the machine",
        correct: true,
        why: "A ceiling is met by intersection. The grant has to come from the manifest, and this one asked for nothing.",
      },
      {
        text: "The network, but only for accounts that opted in",
        why: "There is no opting in. The ceiling holds every account on the machine the same way, and it still cannot grant.",
      },
    ],
  },
  {
    asks: "Your ceiling names socketSystemBus and nothing else on the bus. What happens to socketBluetooth?",
    choices: [
      {
        text: "Nothing. It was not named, so it is left to the manifest",
        why: "They open the same socket. Closing one and leaving the other would close nothing, so naming either holds both.",
      },
      {
        text: "It is held too, because it opens the same socket",
        correct: true,
        why: "The playground lists what each key you wrote actually holds, which is worth reading before deciding a ceiling is finished.",
      },
      {
        text: "The manifest is refused as ambiguous",
        why: "Nothing is ambiguous. The two names reach one thing and the ceiling holds that thing.",
      },
    ],
  },
  {
    asks: "A package asks for the whole home read-write. Your ceiling allows the home read-only. What runs?",
    choices: [
      {
        text: "Nothing. The request exceeds the ceiling, so the launch is refused",
        why: "Narrowing is not refusing. The grant survives holding less, which is the normal and useful case.",
      },
      {
        text: "The application, with read-only access to the home",
        correct: true,
        why: "A path the ceiling does not cover is a different matter: that one is not downgraded, it is gone.",
      },
      {
        text: "The application, with the read-write access it asked for, and a warning",
        why: "A ceiling is not advice. What it allows is what runs.",
      },
    ],
  },
  {
    asks: "You want to turn on verified launch across a fleet. What do you set first?",
    choices: [
      {
        text: "refuse, so nothing unrecognised ever starts",
        why: "That is the destination, not the first step. You find out which applications stop by having them stop, on other people's Monday morning.",
      },
      {
        text: "warn, and read what it would have refused",
        correct: true,
        why: "It costs nothing, it runs everything, and it names every package that would fail before any of them does.",
      },
      {
        text: "off, and set a ceiling instead",
        why: "They answer different questions. A ceiling decides how wide anything may be; enforcement decides whether a launch matches what was recorded.",
      },
    ],
  },
  {
    asks: "The host requires signatures and an unsigned application is installed. What happens?",
    choices: [
      {
        text: "The install is rolled back and its files are removed",
        why: "Signature policy refuses enrolment. It does not turn a completed install into a partial removal.",
      },
      {
        text: "The application stays installed but unenrolled, then enforcement decides whether it may launch",
        correct: true,
        why: "Signature policy records the missing identity at enrolment. Warn or refuse then decides what an unenrolled launch does.",
      },
      {
        text: "It launches once so the user can approve its signer",
        why: "There is no first-launch exception. Approval belongs in the host trust policy.",
      },
    ],
  },
  {
    asks: "What is the difference between require_publisher and require_approval?",
    choices: [
      {
        text: "Publisher checks an accepted signer; approval requires the organisation to countersign the exact package state",
        correct: true,
        why: "One proves accepted provenance. The other records review of this exact state.",
      },
      {
        text: "Publisher applies to public registries; approval applies to private registries",
        why: "Registry visibility does not define either policy.",
      },
      {
        text: "They are aliases kept for manifest version 1 compatibility",
        why: "They represent separate decisions and can be required independently.",
      },
    ],
  },
  {
    asks: "A revocation names an origin but no generation. What does it withdraw?",
    choices: [
      {
        text: "Only the newest installed generation",
        why: "A generation must be named to narrow the revocation to one generation.",
      },
      {
        text: "Only generations installed after the policy was written",
        why: "The decision is not based on installation time.",
      },
      {
        text: "Every generation of that origin",
        correct: true,
        why: "Leaving generation out revokes the origin across all generations.",
      },
    ],
  },
  {
    asks: "A removed package refuses enrolment after reinstall. What is the safe order to investigate?",
    choices: [
      {
        text: "clear-removal, status, explain",
        why: "That gives up the rollback floor before proving it caused the refusal.",
      },
      {
        text: "status, explain, then clear-removal only after reading what will be lost",
        correct: true,
        why: "The first two report. The last changes the host anchor and belongs last.",
      },
      {
        text: "remove the trust policy and reinstall",
        why: "That widens the whole host and still does not identify the retained removal anchor.",
      },
    ],
  },
];
