/**
 * Facts the privacy notice states about who runs Mirian and where data lives.
 *
 * These are legal statements, not copy. They must match the solicitor-reviewed
 * policy drafts (Mirian_GDPR_Policy_Drafts.docx). CHECK EVERY ONE before
 * launch, and update lastUpdated whenever the notice changes.
 */
export const LEGAL = {
  service: "Mirian",
  /**
   * The data controller. A sole trader, so there's no Companies House number
   * or registered office to show.
   */
  controller: "Hannah Feehan, trading as Jorvik Web Dev (Sael North)",
  /** CONFIRM: the drafts leave the data protection contact blank. */
  contactEmail: "hello@jorvikweb.dev",
  /** ICO data protection fee registration number, once registered. */
  icoRegistration: null as string | null,
  /** Where the Supabase project is hosted (eu-central-1). */
  databaseRegion: "Frankfurt, Germany" as string | null,
  lastUpdated: "14 September 2026",
};
