// A limit on how often one address can ask this site about a code.
//
// It is not what keeps a credential unfindable. A code is sixteen characters
// from an alphabet of thirty-two, so working through them is not a plan
// anybody has. It is here because the verification page answers "does this
// code exist" to whoever asks, and a page that answers that should not answer
// it thousands of times a minute to the same caller.
//
// The count is held in the isolate's memory. That needs no binding and costs
// nothing, and it is honest about its own reach: a caller spread across
// several isolates gets several windows. What it stops is the cheap version.

const WINDOW = 60_000;
const ALLOWED = 20;

export const TOO_OFTEN = `This page answers ${ALLOWED} codes a minute from one address, and this address has asked for more. Wait a minute and ask again.`;

const windows = new Map<string, { until: number; asked: number }>();

// Nothing sweeps this on a timer, so it is swept on the way past, and only
// once there is enough in it to be worth walking.
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
