import { PASSWORD_EXAMPLE, PASSWORD_RULES } from "@/lib/password";

/**
 * The password rules, as a list, next to the box.
 *
 * One component rather than the same markup on four forms — so the sign-up
 * page, the reset page and settings can't drift apart, which is how one of
 * them ends up still claiming eight characters.
 */
export default function PasswordHint() {
  return (
    <div className="mt-2 text-sm text-sage-600">
      <p>Your password needs:</p>
      <ul className="list-disc pl-5 mt-1 space-y-0.5">
        {PASSWORD_RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <p className="mt-2">{PASSWORD_EXAMPLE}</p>
    </div>
  );
}
