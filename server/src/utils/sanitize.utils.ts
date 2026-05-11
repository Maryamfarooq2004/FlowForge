/**
 * sanitize.utils.ts
 * Server-side input sanitization for plain-text fields.
 * Strips all HTML tags using a regex approach (no dompurify/jsdom dependency).
 * Apply to EVERY string field before persisting to MongoDB.
 */

/**
 * Strip HTML/script tags and trim whitespace from any string.
 * Returns empty string for non-string or falsy input.
 */
export const sanitizeText = (input: unknown): string => {
  if (!input || typeof input !== 'string') return '';
  // Remove all HTML tags (including self-closing)
  const stripped = input.replace(/<[^>]*>/g, '');
  // Collapse multiple spaces/newlines to single space where needed (keep newlines for readability)
  return stripped.trim();
};

/**
 * Sanitize intake screen text — strip HTML and enforce server-side maxlength.
 * @param text   Raw input from the request body
 * @param max    Maximum character limit (default 5000 matching schema)
 */
export const sanitizeIntakeText = (text: unknown, max = 5000): string => {
  return sanitizeText(text).substring(0, max);
};

/**
 * Sanitize a string array — strip HTML from each element, remove empties.
 */
export const sanitizeStringArray = (arr: unknown): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => sanitizeText(item))
    .filter((item) => item.length > 0);
};
