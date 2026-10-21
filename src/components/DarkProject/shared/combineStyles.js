// Combines the global experience and project-specific CSS modules.
// Both classes are applied, keeping nested selectors working after the split.
export function combineStyles(shared, specific) {
  return new Proxy({}, {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      return [shared[key], specific[key]].filter(Boolean).join(" ");
    },
  });
}
