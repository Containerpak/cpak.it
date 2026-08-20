/**
 * Where a choice sits, decided by the question rather than by whoever wrote it.
 *
 * An author writing multiple choice puts the right answer second almost every
 * time: it feels wrong first and buried last. Measured on this material before
 * this file existed, the right answer was the second one in every single quiz
 * question, and in seven of the ten administrator exam questions, which means
 * a candidate who knew nothing and always pressed the second one scored 70 per
 * cent against a pass mark of 80.
 *
 * So the order is not the author's. It comes from the question text, which
 * makes it stable: the same question always presents its choices the same way,
 * a reader who reloads does not see them move, and the server and the browser
 * derive the same order without sending it. And it cannot regress, because a
 * new question written with the same habit is reordered like every other.
 */

/** FNV-1a, for a small stable number from a string. */
function seedOf(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** A tiny deterministic generator, so the shuffle is repeatable. */
function next(state: number): number {
  let x = state;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >> 17;
  x ^= x << 5;
  x >>>= 0;
  return x;
}

function shuffle<T>(items: T[], seed: number): T[] {
  const out = items.slice();
  let state = seed || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = next(state);
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Which column the right answer sits in, for each question of a paper.
 *
 * Built as an even cycle and then shuffled, so every column carries within one
 * of the same number of right answers no matter how the questions are written.
 * Shuffling only the choices was not enough: it is uniform on average and this
 * paper was not average, and one column still held seven of ten.
 */
export function placements(salt: string, questions: number, columns: number) {
  const even = Array.from({ length: questions }, (_, i) => i % columns);
  return shuffle(even, seedOf(salt));
}

/**
 * The positions of one question's choices, given where the right one goes.
 * `orderOf(...)` returns, for each column, which original choice to show there.
 */
export function orderOf(
  question: string,
  count: number,
  correct: number,
  target: number,
): number[] {
  const others = shuffle(
    Array.from({ length: count }, (_, i) => i).filter((i) => i !== correct),
    seedOf(question),
  );
  const out: number[] = [];
  for (let column = 0; column < count; column += 1) {
    out.push(column === target ? correct : (others.shift() as number));
  }
  return out;
}

/** One question's choices, in the order they should be shown. */
export function shuffled<T>(
  question: string,
  items: T[],
  correct: number,
  target: number,
): T[] {
  return orderOf(question, items.length, correct, target).map((at) => items[at]);
}
