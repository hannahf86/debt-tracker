/**
 * Turns a Postgres error into something worth showing someone.
 *
 * The generic "Failed to create X" hides conditions we actually understand —
 * a missing account row reads identically to the database being down.
 */
export function describeDbError(error: unknown, fallback: string): string {
  const e = error as { code?: string; message?: string; details?: string } | null;
  switch (e?.code) {
    case "23503": // foreign_key_violation
      return "Your account isn't fully set up yet. Sign out and back in, and if it keeps happening let us know.";
    case "23505": // unique_violation
      return "That already exists.";
    case "23502": // not_null_violation
      return "Something required was missing. Check the form and try again.";
    case "42501": // insufficient_privilege
      return "You don't have permission to do that.";
    default:
      return fallback;
  }
}
