// Deterministic helper so visuals don't jitter on every render.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function makeSeries(
  length: number,
  base: number,
  variance: number,
  seed = 1,
  trend = 0,
): number[] {
  const rand = seeded(seed);
  const out: number[] = [];
  for (let i = 0; i < length; i += 1) {
    const wobble = (rand() - 0.5) * variance;
    out.push(Math.max(0, base + trend * i + wobble));
  }
  return out;
}

export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function toLabeled(values: number[], labels: string[]) {
  return values.map((v, i) => ({ label: labels[i] ?? `${i + 1}`, value: v }));
}
