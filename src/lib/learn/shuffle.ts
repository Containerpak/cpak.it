function seedOf(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

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

export function placements(salt: string, questions: number, columns: number) {
  const even = Array.from({ length: questions }, (_, i) => i % columns);
  return shuffle(even, seedOf(salt));
}

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

export function shuffled<T>(
  question: string,
  items: T[],
  correct: number,
  target: number,
): T[] {
  return orderOf(question, items.length, correct, target).map(
    (at) => items[at],
  );
}
