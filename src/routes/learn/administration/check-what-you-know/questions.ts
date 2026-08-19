import type { Question } from "$lib/components/learn/Quiz.svelte";

// Four questions on the two decisions an administrator actually makes. Every
// wrong answer is a real misreading of what a ceiling is, and the first one is
// the misreading that produces a ceiling nobody notices is doing nothing.
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
];
