const WINDOW = 60_000;
const ALLOWED = 20;

export const TOO_OFTEN = `This page answers ${ALLOWED} codes a minute from one address, and this address has asked for more. Wait a minute and ask again.`;

const windows = new Map<string, { until: number; asked: number }>();

function sweep(now: number) {
  if (windows.size < 1024) return;
  for (const [address, held] of windows) {
    if (held.until <= now) windows.delete(address);
  }
}

export function askedTooOften(address: string, now = Date.now()) {
  sweep(now);
  const held = windows.get(address);
  if (!held || held.until <= now) {
    windows.set(address, { until: now + WINDOW, asked: 1 });
    return false;
  }
  held.asked += 1;
  return held.asked > ALLOWED;
}
