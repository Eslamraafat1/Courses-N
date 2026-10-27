/** Each dict file exports `defineDict({ en: {...}, ar: {...} })`; TypeScript enforces key parity between languages. */
export function defineDict<K extends string>(d: { en: Record<K, string>; ar: Record<K, string> }) {
  return d;
}
