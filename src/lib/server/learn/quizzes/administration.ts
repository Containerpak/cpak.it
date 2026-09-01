import type { QuizQuestion } from "$lib/learn/quiz";

export const QUESTIONS: QuizQuestion[] = [
  {
    asks: 'Your ceiling contains "network": true. A package asks for nothing. What can it reach?',
    choices: [
      {
        text: "The network, because the host allows it",
        why: "A ceiling never grants. Writing true says this host will not stand in the way, which is what leaving the key out already said.",
      },
      {
        text: "Nothing off the machine",
        correct: true,
        why: "A ceiling is met by intersection. The grant has to come from the manifest or a saved local override, and this package has neither.",
      },
      {
        text: "The network, but only for accounts that opted in",
        why: "There is no opting in. The ceiling holds every account on the machine the same way, and it still cannot grant.",
      },
    ],
  },
  {
    asks: "An application asks for List and Open on one session service. Its ceiling allows only List. What survives?",
    choices: [
      {
        text: "Both methods, because the destination is allowed",
        why: "The policy intersects exact methods as well as the destination, path and interface.",
      },
      {
        text: "Only List",
        correct: true,
        why: "Typed bus rules are narrowed call by call. The package never receives the raw session bus socket.",
      },
      {
        text: "Neither method, because a ceiling cannot contain bus rules",
        why: "A manifest v3 ceiling can restrict an exact sessionBus policy.",
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
