/**
 * Input sanitization utilities — ConectAr HR
 *
 * Prevents XSS, SQL injection patterns, and path traversal
 * before data reaches business logic or database layers.
 */

// ─── XSS ─────────────────────────────────────────────────────────────────────

const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,        // onclick=, onload=, etc.
  /<\s*iframe/gi,
  /<\s*object/gi,
  /<\s*embed/gi,
  /<\s*link/gi,
  /data\s*:\s*text\/html/gi,
  /vbscript\s*:/gi,
];

/**
 * Strips HTML tags and known XSS vectors from a string.
 * Use for any user-supplied text rendered in the UI.
 */
export function sanitizeText(input: string): string {
  let out = String(input);
  // Remove HTML tags
  out = out.replace(/<[^>]*>/g, '');
  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => { out = out.replace(pattern, ''); });
  // Encode remaining dangerous chars
  out = out.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
  return out.trim();
}

// ─── SQL injection detection ──────────────────────────────────────────────────

const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC|EXECUTE|UNION|CAST|CONVERT)\b)/gi,
  /(-{2}|\/\*|\*\/|;|\bOR\b\s+\d+=\d+|\bAND\b\s+\d+=\d+)/gi,
  /'\s*(OR|AND)\s*'[^']*'\s*=\s*'/gi,
  /1\s*=\s*1/g,
  /0x[0-9a-f]+/gi,
  /char\s*\(\s*\d+/gi,
];

/**
 * Returns true if the input contains SQL injection patterns.
 * Log and reject requests where this returns true.
 */
export function hasSQLInjection(input: string): boolean {
  return SQL_PATTERNS.some(pattern => pattern.test(input));
}

// ─── Path traversal ───────────────────────────────────────────────────────────

export function hasPathTraversal(input: string): boolean {
  return /(\.\.[/\\]|[/\\]\.\.)/.test(input);
}

// ─── Email validation ─────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  // RFC 5322 simplified — good enough for practical use
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)
    && email.length <= 254;
}

// ─── Generic object sanitizer ─────────────────────────────────────────────────

/**
 * Recursively sanitizes all string values in a plain object.
 * Safe to call on API request bodies before processing.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
