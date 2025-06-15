
import DOMPurify from "dompurify";

/**
 * Sanitize a string input to prevent XSS.
 * Use for any user-provided text fields that may appear in the DOM.
 **/
export function sanitizeInput(value: string): string {
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(value);
  }
  // fallback (SSR): just return the string
  return value;
}
