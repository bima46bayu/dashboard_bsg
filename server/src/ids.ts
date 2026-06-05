export function nextPrefixedId(prefix: string, existing: string[]) {
  const maxN = existing.reduce((acc, id) => {
    const n = Number(id.replace(`${prefix}-`, ""));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefix}-${String(maxN + 1).padStart(4, "0")}`;
}
