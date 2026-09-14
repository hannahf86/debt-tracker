import { describeContact } from "@/lib/templates";
import { ordinal } from "@/lib/format";

/**
 * "Download my data" as a readable PDF: account, a summary, then each debt
 * with its payments, notes and contact history. Laid out for reading,
 * printing, or handing to a debt adviser.
 *
 * Built in the browser from the same JSON /api/users/export returns, so the
 * PDF and the data file can never disagree. jsPDF only loads when asked for.
 */

type Row = Record<string, unknown>;

export type ExportFile = {
  exported_at: string;
  account: {
    email: string | null;
    created_at: string | null;
    details: Record<string, unknown>;
  };
  profile: Row | null;
  debts: Row[];
  payments: Row[];
  missed_payment_notes: Row[];
  contact_history: Row[];
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const WIDTH = PAGE_W - MARGIN * 2;
const BOTTOM = PAGE_H - 16;
const LABEL_W = 50;

type RGB = [number, number, number];
const INK: RGB = [24, 40, 42];
const MUTED: RGB = [95, 112, 115];
const BRAND: RGB = [26, 102, 106];
const RULE: RGB = [215, 228, 228];

const PAYMENT_TYPES: Record<string, string> = {
  "on-time": "On time",
  late: "Late",
  partial: "Short",
  "partial-late": "Short and late",
  overpaid: "Overpaid",
};

const ARRANGEMENTS: Record<string, string> = {
  "payment-plan": "Payment plan in place",
  "needs-setting-up": "More details can be added",
  "awaiting-response": "Awaiting response",
  "account-in-default": "Account in default",
  "not-set": "Not set",
};

const CATEGORIES: Record<string, string> = {
  "credit-card": "Credit card",
  loan: "Loan",
  utilities: "Utilities",
  tax: "Tax",
  household: "Household",
  other: "Other",
};

// The built-in PDF font only covers Windows-1252. Anything outside it (emoji,
// most non-Latin scripts) would print as garbage, so it's dropped instead.
const CP1252_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
function clean(value: string): string {
  return Array.from(value.replace(/\r\n/g, "\n"))
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return (
        ch === "\n" ||
        (code >= 32 && code <= 126) ||
        (code >= 160 && code <= 255) ||
        CP1252_EXTRA.includes(ch)
      );
    })
    .join("");
}

const str = (v: unknown): string => (v == null ? "" : String(v));

function money(v: unknown): string {
  const n = Number(v);
  if (v == null || v === "" || Number.isNaN(n)) return "—";
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function date(v: unknown, withYear = true): string {
  if (!v) return "—";
  const d = new Date(str(v));
  if (Number.isNaN(d.getTime())) return str(v);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

function monthYear(month: unknown, year: unknown): string {
  const m = Number(month);
  const y = Number(year);
  if (!m || !y) return "—";
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export async function buildDataPdf(data: ExportFile) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN + 6;

  const lineHeight = (size: number) => size * 0.43;

  const style = (size: number, weight: "normal" | "bold", color: RGB) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const newPageIfNeeded = (height: number) => {
    if (y + height > BOTTOM) {
      doc.addPage();
      y = MARGIN + 6;
    }
  };

  const gap = (mm: number) => {
    y += mm;
  };

  /** Wrapped text; paragraphs split on newlines. */
  const write = (
    value: string,
    opts: { size?: number; weight?: "normal" | "bold"; color?: RGB; indent?: number } = {},
  ) => {
    const size = opts.size ?? 10;
    const indent = opts.indent ?? 0;
    style(size, opts.weight ?? "normal", opts.color ?? INK);
    for (const paragraph of clean(value).split("\n")) {
      const lines = paragraph.trim()
        ? (doc.splitTextToSize(paragraph, WIDTH - indent) as string[])
        : [""];
      for (const line of lines) {
        newPageIfNeeded(lineHeight(size));
        doc.text(line, MARGIN + indent, y);
        y += lineHeight(size);
      }
    }
  };

  const rule = () => {
    doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y - 2.2, PAGE_W - MARGIN, y - 2.2);
    gap(2);
  };

  const heading = (value: string) => {
    newPageIfNeeded(22);
    gap(5);
    write(value, { size: 14, weight: "bold", color: BRAND });
    rule();
  };

  const subheading = (value: string) => {
    newPageIfNeeded(14);
    gap(3);
    write(value, { size: 10.5, weight: "bold" });
    gap(0.5);
  };

  /** Label on the left, value on the right. */
  const field = (label: string, value: unknown) => {
    const text = clean(str(value).trim() || "—");
    style(10, "normal", INK);
    const lines = doc.splitTextToSize(text, WIDTH - LABEL_W) as string[];
    newPageIfNeeded(lineHeight(10) * lines.length);
    style(10, "normal", MUTED);
    doc.text(clean(label), MARGIN, y);
    style(10, "normal", INK);
    lines.forEach((line, i) => doc.text(line, MARGIN + LABEL_W, y + i * lineHeight(10)));
    y += lineHeight(10) * lines.length + 1;
  };

  const exportedOn = date(data.exported_at);

  // ---- Title ----
  write("Your data from Mirian", { size: 20, weight: "bold", color: BRAND });
  gap(2);
  write(
    `Exported on ${exportedOn}. This is everything Mirian holds about you. Your password isn't included: it's stored scrambled, and nobody at Mirian can read it.`,
    { size: 9.5, color: MUTED },
  );

  // ---- Account ----
  const details = data.account.details ?? {};
  heading("Your account");
  field("Email", data.account.email);
  field("Name", details.name);
  field("Display name", details.display_name);
  field("Account created", date(data.account.created_at));
  field("Monthly budget", data.profile?.monthly_budget == null ? "—" : money(data.profile.monthly_budget));

  // ---- Summary ----
  const debts = data.debts ?? [];
  const payments = data.payments ?? [];
  const notes = data.missed_payment_notes ?? [];
  const contacts = data.contact_history ?? [];
  const sum = (rows: Row[], key: string) =>
    rows.reduce((total, r) => total + (Number(r[key]) || 0), 0);

  heading("Summary");
  field("Debts", String(debts.length));
  field("Total when added", money(sum(debts, "total_amount")));
  field("Still owed", money(sum(debts, "amount_owed")));
  field("Payments logged", String(payments.length));
  field("Total paid", money(sum(payments, "amount")));
  field("Messages to companies", String(contacts.length));

  // ---- Debts ----
  heading("Your debts");
  if (debts.length === 0) write("You haven't added any debts.", { color: MUTED });

  for (const debt of debts) {
    const company = str(debt.company) || "Unnamed debt";
    const id = str(debt.id);

    newPageIfNeeded(40);
    gap(4);
    write(company, { size: 12.5, weight: "bold" });
    gap(1);
    field("Total when added", money(debt.total_amount));
    field("Still owed", money(debt.amount_owed));
    field("Monthly payment", debt.monthly_amount == null ? "—" : money(debt.monthly_amount));
    field(
      "Direct debit date",
      debt.direct_debit_date ? `${ordinal(Number(debt.direct_debit_date))} of the month` : "—",
    );
    field("Category", CATEGORIES[str(debt.category)] ?? debt.category);
    field("Arrangement", ARRANGEMENTS[str(debt.arrangement)] ?? debt.arrangement);
    field("Account reference", debt.account_reference);
    field("Company email", debt.company_email);
    field("Added to Mirian", date(debt.created_at));

    // Payments for this debt
    const debtPayments = payments.filter((p) => str(p.debt_id) === id);
    subheading(`Payments (${debtPayments.length})`);
    if (debtPayments.length === 0) {
      write("No payments logged.", { color: MUTED, indent: 4 });
    } else {
      for (const p of debtPayments) {
        newPageIfNeeded(lineHeight(10));
        style(10, "normal", INK);
        doc.text(date(p.payment_date), MARGIN + 4, y);
        doc.text(money(p.amount), MARGIN + 62, y, { align: "right" });
        style(10, "normal", MUTED);
        doc.text(PAYMENT_TYPES[str(p.payment_type)] ?? str(p.payment_type), MARGIN + 70, y);
        y += lineHeight(10) + 0.6;
      }
    }

    // Notes about late or short payments
    const debtNotes = notes.filter((n) => str(n.debt_id) === id);
    if (debtNotes.length > 0) {
      subheading("Notes about late or short payments");
      for (const n of debtNotes) {
        write(`${monthYear(n.month, n.year)}: ${str(n.reason) || "—"}`, { indent: 4 });
        gap(0.8);
      }
    }

    // Contact history
    const debtContacts = contacts.filter((c) => str(c.debt_id) === id);
    if (debtContacts.length > 0) {
      subheading("Contact history");
      for (const c of debtContacts) {
        write(
          describeContact(
            {
              method: c.method as "email" | "copy" | "letter",
              template: str(c.template),
              sent_at: str(c.sent_at),
            },
            company,
          ),
          { indent: 4, weight: "bold" },
        );
        if (c.subject) write(`Subject: ${str(c.subject)}`, { indent: 4, color: MUTED, size: 9.5 });
        gap(0.8);
        write(str(c.body), { indent: 8, size: 9.5 });
        gap(2.5);
      }
    }

    gap(2);
  }

  // ---- Footer on every page ----
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    style(8, "normal", MUTED);
    doc.text(`Mirian · Your data · exported ${exportedOn}`, MARGIN, PAGE_H - 9);
    doc.text(`Page ${i} of ${pages}`, PAGE_W - MARGIN, PAGE_H - 9, { align: "right" });
  }

  return doc;
}

export async function downloadDataPdf(data: ExportFile) {
  const doc = await buildDataPdf(data);
  doc.save(`mirian-data-${data.exported_at.slice(0, 10)}.pdf`);
}
