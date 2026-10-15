/**
 * Text helpers for matching what a user types against names in three scripts.
 */

/**
 * Folds a string into a form suitable for loose matching: lowercased, with the
 * punctuation that appears in transliterated names removed.
 *
 * This is what lets "ali imran" match "Ali 'Imran" and "al fatihah" match
 * "Al-Fatihah". Bangla is unaffected apart from losing the hyphen, so "কাহফ"
 * still matches inside "আল-কাহফ".
 */
export function foldForSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s'’`\-–—.,!?()[\]]/g, '');
}

/** True when `haystack` contains `needle`, ignoring case and punctuation. */
export function looseIncludes(haystack: string, needle: string): boolean {
  return foldForSearch(haystack).includes(foldForSearch(needle));
}
