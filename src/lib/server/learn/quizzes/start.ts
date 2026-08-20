import type { QuizQuestion } from "$lib/learn/quiz";

export const QUESTIONS: QuizQuestion[] = [
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
        why: "The installation prompt shows what the publisher requested and lets you narrow it. After installation, a saved local override may add access on an unmanaged host.",
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
    asks: 'Keep only "socketWayland": true in the permissions playground. How many host paths does that one permission bind?',
    choices: [
      {
        text: "One, the socket the window is drawn through",
        why: "The socket is there, and something else came with it. The playground lists both, with a line under each saying what it is.",
      },
      {
        text: "Two: the compositor socket and the lock beside it",
        correct: true,
        why: "One permission, two paths. This is why the list under a permission is worth reading and its name is not.",
      },
      {
        text: "Six, once the display is counted",
        why: "Six is what socketX11 binds. Replace the key and compare the two answers.",
      },
    ],
  },
  {
    asks: 'What does adding "deviceDri": true to an administrator\'s ceiling change?',
    choices: [
      {
        text: "It grants the graphics device to every package on that host",
        why: "A ceiling can remove access, but it cannot grant it.",
      },
      {
        text: "Nothing. A true ceiling entry is the same as leaving the key out",
        correct: true,
        why: "The manifest still decides whether the package asks for the graphics device.",
      },
      {
        text: "It grants the graphics device only to packages that ask for it",
        why: "Those packages get the grant from their own manifests. The ceiling merely leaves it untouched.",
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
        why: "Your override replaces the manifest permissions. You may remove this permission now, restore it later or add another one. A system ceiling still sets the maximum on a managed host.",
      },
      {
        text: "Edit the manifest before installing",
        why: "The manifest is the publisher's, and it is what the signature is over. What you write is your own override, kept beside it.",
      },
    ],
  },
];
