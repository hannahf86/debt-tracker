/**
 * What counts as an acceptable password, in one place.
 *
 * These rules are set in Supabase (Authentication → Providers → Email), and
 * Supabase is what enforces them. This file exists so the app can say the same
 * thing *before* someone submits, rather than letting them type a password,
 * press the button and be told off afterwards — which is the version that
 * makes people give up.
 *
 * If the rules change in Supabase, change them here too. The two drifting
 * apart is how you get "please use at least 8 characters" on a form that
 * actually wants 12.
 */

export const PASSWORD_MIN_LENGTH = 12;

/** Supabase is set to require each of these. */
const CLASSES: { test: RegExp; label: string }[] = [
  { test: /[a-z]/, label: "a small letter" },
  { test: /[A-Z]/, label: "a capital letter" },
  { test: /[0-9]/, label: "a number" },
  { test: /[^A-Za-z0-9]/, label: "a symbol, like ! or £" },
];

/** Said up front, next to the box, so nothing is a surprise. */
export const PASSWORD_HINT =
  `At least ${PASSWORD_MIN_LENGTH} characters, with a capital, a small letter, ` +
  `a number and a symbol. Something like Three!Blue£Hens2 — long and memorable ` +
  `beats short and clever.`;

/**
 * What's still missing, as a sentence, or null when it's fine.
 *
 * Deliberately lists everything that's missing at once. Telling someone one
 * fault at a time, so they fix it and get told off again, is its own small
 * cruelty.
 */
export function checkPassword(password: string): string | null {
  const problems: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    problems.push(`${PASSWORD_MIN_LENGTH} characters or more`);
  }
  for (const { test, label } of CLASSES) {
    if (!test.test(password)) problems.push(label);
  }

  if (problems.length === 0) return null;

  const list =
    problems.length === 1
      ? problems[0]
      : `${problems.slice(0, -1).join(", ")} and ${problems[problems.length - 1]}`;

  return `This one still needs ${list}.`;
}
