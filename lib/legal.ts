/**
 * Facts the privacy notice states about who runs Mirian and where data lives.
 *
 * These are legal statements, not copy. They must match the solicitor-reviewed
 * policy drafts (Mirian_GDPR_Policy_Drafts.docx). CHECK EVERY ONE before
 * launch, and update lastUpdated whenever the notice changes.
 */
export const LEGAL = {
  service: "Mirian",
  /** The data controller, per the policy drafts. */
  controller: "Sael North Ltd",
  registeredIn: "England and Wales",
  /** Companies House number. Shown once set. */
  companyNumber: null as string | null,
  /** Registered office address. Shown once set. */
  registeredOffice: null as string | null,
  /** CONFIRM: the drafts leave the data protection contact blank. */
  contactEmail: "hello@jorvikweb.dev",
  /** ICO data protection fee registration number, once registered. */
  icoRegistration: null as string | null,
  /** Where the Supabase project is hosted, e.g. "London, UK". CONFIRM. */
  databaseRegion: null as string | null,
  lastUpdated: "14 September 2026",
};
