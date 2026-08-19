// Badges.
//
// A badge here is a note to yourself. Everything one could be based on is
// self-reported: a lesson is done because a browser said so, and nothing
// checks that the lesson was read or the playground understood. So a badge is
// not evidence of anything, and this site never treats it as any. It is shown
// on the account page and nowhere else: no public page, no address of its own,
// no image to embed, nothing to send to anyone. A credential is the only thing
// here that attests a result, and it does that because an exam produced it
// under an authenticated account.
//
// That still leaves badges worth having. "Which course did I finish and which
// did I abandon in the middle" is a real question about your own work, and it
// is the question the maintainer asked the account page to answer.

import { byTrack, type Done } from "./progress";

export type Badge = {
  course: string;
  title: string;
  done: number;
  total: number;
  earned: boolean;
  at: string;
};

export function badgesFrom(entries: Done[]): Badge[] {
  return byTrack(entries).map((group) => {
    const done = group.entries.length;
    const last = group.entries[group.entries.length - 1];
    return {
      course: group.course,
      title: group.title,
      done,
      total: group.total,
      earned: group.total > 0 && done >= group.total,
      at: last?.completedAt ?? "",
    };
  });
}
