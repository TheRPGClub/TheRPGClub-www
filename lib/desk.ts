// Pure helpers behind the staff desk's shared pieces (components/admin/desk).

// Typed-word confirm: the typed text matches the words shown, ignoring case,
// surrounding space and runs of space ("reset  gotm " matches "RESET GOTM").
export function typedWordsMatch(typed: string, words: string): boolean {
  const norm = (s: string) => s.trim().replace(/\s+/g, " ").toUpperCase();
  return norm(words) !== "" && norm(typed) === norm(words);
}

// How long a delete waits behind the Undo bar before it is sent.
export const UNDO_DELAY_MS = 6_000;

// The letter a dictionary headword files under: its first letter without
// accents, A to Z, or "#" for anything else (digits, symbols).
export function dictionaryLetter(headword: string): string {
  const first = headword
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .charAt(0)
    .toUpperCase();
  return first >= "A" && first <= "Z" ? first : "#";
}

export const DICTIONARY_LETTERS: readonly string[] = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "#",
];

// Items sorted by headword (case and accents ignored) and grouped under
// their letter, letters in A to Z order with "#" last. Empty letters are
// left out.
export function groupByLetter<T>(
  items: readonly T[],
  headword: (item: T) => string,
): { letter: string; items: T[] }[] {
  const sorted = [...items].sort((a, b) =>
    headword(a).localeCompare(headword(b), "en", { sensitivity: "base" }),
  );
  const groups = new Map<string, T[]>();
  for (const item of sorted) {
    const letter = dictionaryLetter(headword(item));
    const group = groups.get(letter);
    if (group) group.push(item);
    else groups.set(letter, [item]);
  }
  return DICTIONARY_LETTERS.filter((l) => groups.has(l)).map((letter) => ({
    letter,
    items: groups.get(letter)!,
  }));
}
