/**
 * Opaque base64 cursors for keyset pagination.
 *
 * A cursor captures the sort value + unique id of the last row on a page so the
 * next query can resume deterministically.
 */

export function encodeCursor({ sortValue, sortValue2, id }) {
  const payload =
    sortValue2 !== undefined
      ? { sortValue, sortValue2, id }
      : { sortValue, id };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function decodeCursor(cursor) {
  if (!cursor) return null;

  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString());
  } catch {
    return null;
  }
}
