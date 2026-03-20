/**
 * Strips HTML tags from a string and enforces a maximum length.
 * Protects against stored XSS and oversized payloads.
 */
export function sanitizeText(input: string, maxLength: number): string {
  // Strip HTML tags
  const stripped = input.replace(/<[^>]*>/g, '').trim()
  // Enforce max length
  return stripped.slice(0, maxLength)
}
