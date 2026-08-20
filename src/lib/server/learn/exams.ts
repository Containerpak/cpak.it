/**
 * The exams, and the answers to them.
 *
 * This file is under `server` for one reason: the key never reaches a browser.
 * The quiz ships its answers to the page because its whole job is to tell you
 * straight away why you were wrong. An exam whose answers are in the page
 * source is not an exam, so the client is sent the questions and the choices
 * and nothing else, and the marking happens here.
 *
 * An exam is deliberately not a longer quiz. It is sat once through with no
 * feedback until the end, it needs an account because the credential names a
 * handle, and it decides something: at or above the pass mark a credential is
 * issued, below it nothing is, and either way the page says the score.
 */

export type ExamQuestion = {
  asks: string;
  /** The choices, in the order they are shown. */
  choices: string[];
  /** Index of the right one. Never serialised to the client. */
  correct: number;
};

export type Exam = {
  id: string;
  /** What the exam is called while you sit it. */
  title: string;
  /** What the credential says once you hold it. */
  credential: string;
  /** The course it follows, so a candidate can go back and read. */
  course: { title: string; href: string };
  /** The share of questions needed, out of one. */
  pass: number;
  questions: ExamQuestion[];
};

// 0.8 rather than a bare majority. A credential that a coin flip plus a little
// reading can produce is worth nothing to the person holding it, and this is
// open book: the questions are answerable by somebody who has the manifest
// reference open and understands it, which is exactly the bar being claimed.
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
    ],
  },
};

/** What the client is allowed to see: everything except which one is right. */
export function asked(exam: Exam) {
  return {
    id: exam.id,
    title: exam.title,
    credential: exam.credential,
    course: exam.course,
    pass: exam.pass,
    questions: exam.questions.map((question) => ({
      asks: question.asks,
      choices: question.choices,
    })),
  };
}

export type Marked = {
  right: number;
  total: number;
  share: number;
  passed: boolean;
};

/** Mark one sitting. `given` is one answer index per question, or null. */
export function mark(exam: Exam, given: (number | null)[]): Marked {
  const right = exam.questions.reduce(
    (count, question, index) =>
      count + (given[index] === question.correct ? 1 : 0),
    0,
  );
  const total = exam.questions.length;
  const share = total === 0 ? 0 : right / total;
  return { right, total, share, passed: share >= exam.pass };
}
