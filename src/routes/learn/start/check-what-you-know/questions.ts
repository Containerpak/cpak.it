import type { Question } from "$lib/components/learn/Quiz.svelte";

// Five questions, one per thing the course exists to correct.
//
// Every wrong answer is something people actually believe about cpak before
// they have read this, which is what makes answering worth anything: a wrong
// answer nobody would pick teaches nobody. The explanations name where the
// answer came from, so a reader who got it wrong knows which lesson to reopen.
export const QUESTIONS: Question[] = [
  {
    asks: "You install a program the ordinary way, and it turns out to be malicious. What can it read?",
    choices: [
      {
        text: "Only the directories it declared it needed",
        why: "Nothing declared anything. An ordinary package manager installs a program that runs as you, and nobody was asked about anything.",
      },
      {
        text: "Every file your own account can read",
        correct: true,
        why: "Your documents, your photos, your browser profile, your keys. That is the situation cpak exists to change.",
      },
      {
        text: "Nothing, until you grant it something",
        why: "That is what cpak does. An ordinary install grants everything you have by not asking.",
      },
    ],
  },
  {
    asks: "A cpak manifest does not mention the network at all. What can the application reach?",
    choices: [
      {
        text: "The network, since nothing forbade it",
        why: "This is the assumption cpak breaks. Nothing is granted by omission: a permission nobody wrote is a permission the application does not have.",
      },
      {
        text: "Nothing off the machine",
        correct: true,
        why: "A permission written as false and one nobody wrote arrive the same way. It has to be asked for by name.",
      },
      {
        text: "Whatever the person installing it allows at the prompt",
        why: "The prompt shows what was asked for and lets you narrow it. It cannot add something the manifest never asked for.",
      },
    ],
  },
  {
    asks: "A manifest asks for socketX11. What does that one line open?",
    choices: [
      {
        text: "One socket, for drawing a window",
        why: "Six paths, in fact, and rather more than drawing. The playground in lesson 3 lists every one of them.",
      },
      {
        text: "The display, and with it the clipboard, the keystrokes and the pixels of every other window on it",
        correct: true,
        why: "X11 does not separate its clients. This is the clearest case of a permission whose name is a poor guide to what it opens.",
      },
      {
        text: "Nothing on its own: it needs socketWayland too",
        why: "They are alternatives, not a pair. Asking for both is how a package works under either session.",
      },
    ],
  },
  {
    asks: "An administrator's ceiling contains \"deviceDri\": true. What does that give a package?",
    choices: [
      {
        text: "The graphics device, on every installation on that host",
        why: "A ceiling never grants. Writing true in one says the host does not stand in the way, which is what leaving the key out would have said too.",
      },
      {
        text: "Nothing. It says the host will not stand in the way of a package that asks for it",
        correct: true,
        why: "A ceiling is met by intersection: it removes, and it cannot add. An application that asks for nothing keeps nothing under it.",
      },
      {
        text: "The graphics device for packages that also ask for it, and for nothing else",
        why: "Close, but that is what happens anyway. Writing true changed nothing: the grant came from the manifest.",
      },
    ],
  },
  {
    asks: "You install a package and the prompt lists a permission you would rather it did not have. What can you do?",
    choices: [
      {
        text: "Nothing. It is the publisher's decision",
        why: "Your decision replaces the publisher's request. cpak override takes a permission away after the fact.",
      },
      {
        text: "Take it away, and put it back later if the application turns out to need it",
        correct: true,
        why: "An override can only narrow, never widen, and the application runs with what is left. If it stops working you have learned what that permission was for.",
      },
      {
        text: "Edit the manifest before installing",
        why: "The manifest is the publisher's, and it is what the signature is over. What you write is your own override, kept beside it.",
      },
    ],
  },
];
