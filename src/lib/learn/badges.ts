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
