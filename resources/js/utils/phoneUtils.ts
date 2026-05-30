/**
 * Phone number utilities.
 *
 * Max lengths come from libphonenumber-js example numbers keyed by the
 * country's ISO-2 code (cca2), resolved at runtime from the REST Countries
 * API response.  The functions below accept that dynamic map so every phone
 * input on the page stays in sync with the same source.
 *
 * Falls back to 15 (ITU-T E.164 max) for any code not in the map.
 */

/** Returns the maximum digit count for a national number given a dial code. */
export function getPhoneMaxLength(
  dialCode: string,
  maxLengths: Record<string, number> = {},
): number {
  return maxLengths[dialCode] ?? 15;
}

/**
 * Strips every non-digit character and enforces the country-specific length.
 * Call this inside every phone input's onChange handler.
 */
export function sanitizePhone(
  raw: string,
  dialCode: string,
  maxLengths: Record<string, number> = {},
): string {
  const digits = raw.replace(/\D/g, "");
  return digits.slice(0, getPhoneMaxLength(dialCode, maxLengths));
}

/** Placeholder showing the expected number of digits, e.g. "XXXXXXXXXX" (10). */
export function phonePlaceholder(
  dialCode: string,
  maxLengths: Record<string, number> = {},
): string {
  const len = getPhoneMaxLength(dialCode, maxLengths);
  return len === 15 ? "Phone number" : "X".repeat(len);
}
