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
  controller: "Hannah Feehan, trading as Jorvik Web Dev",
  /**
   * Where data protection requests arrive. Mirian's own inbox as of
   * 14 October 2026, forwarded to Hannah — deliberately not the Jorvik Web
   * Dev address, so somebody's debts don't land among client work.
   * CONFIRM: the solicitor drafts leave this blank.
   */
  contactEmail: "hello@mirian-debt-tracker.app",
  /**
   * Who handles data protection questions. Deliberately NOT called a Data
   * Protection Officer: that's a formal appointment under UK GDPR with an
   * independence requirement, and a sole trader who decides how the data is
   * used can't also be her own officer. This is the honest description.
   */
  dataProtectionContact: "Hannah Feehan",
  /** ICO data protection fee registration number. Registered 14 October 2026. */
  icoRegistration: "C2059405" as string | null,
  /** Where the Supabase project is hosted (eu-central-1). */
  databaseRegion: "Frankfurt, Germany" as string | null,
  lastUpdated: "14 October 2026",
};
