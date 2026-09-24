/**
 * Reads one cookie from a raw Cookie header or `document.cookie` string.
 * Names are matched exactly. Values are decoded.
 */
export function readCookie(source: string, name: string): undefined | string {
  const prefix = `${name}=`;
  const match = source.split("; ").find((part) => part.startsWith(prefix));

  if (!match) {
    return undefined;
  }

  return decodeURIComponent(match.slice(prefix.length));
}
