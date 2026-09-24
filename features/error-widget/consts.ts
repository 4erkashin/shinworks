/**
 * Digest Next.js would attach: `string-hash` of message + stack,
 * shown as an unsigned 32-bit decimal. Framework errors may append `@E…`.
 * Stories use this so the footer matches that shape, not a made-up hex id.
 */
export const EXAMPLE_ERROR_DIGEST = "2691371501";
