import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  getStripMonthStatus,
  getDebtStripMonthStatus,
  getMonthStatus,
  startOfMonth,
  trackerStartMonth,
} from "@/lib/hooks/useTracker";
import type { Debt, Payment } from "@/lib/types";

// The strip is always "this year", and every status is relative to today, so
// the clock has to be pinned for these to mean anything.
const TODAY = new Date("2026-09-01T10:00:00Z");
const YEAR = 2026;
const JAN = 0;
const APR = 3;
const AUG = 7;
const SEP = 8;

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TODAY);
});
afterAll(() => {
  vi.useRealTimers();
});

const debt = (over: Partial<Debt> = {}): Debt =>
  ({
    id: "debt-1",
    user_id: "user-1",
    name: "Aqua Card",
    company: "Aqua Card",
    amount_owed: 800,
    total_amount: 1000,
    monthly_amount: 100,
    category: "credit-card",
    arrangement: "payment-plan",
    direct_debit_date: 5,
    account_reference: null,
    company_email: null,
    // Added this month — so every earlier month of 2026 predates it.
    created_at: "2026-09-01T09:00:00Z",
    updated_at: "2026-09-01T09:00:00Z",
    ...over,
  }) as Debt;

const payment = (over: Partial<Payment> = {}): Payment =>
  ({
    id: "pay-1",
    debt_id: "debt-1",
    amount: 100,
    expected_amount: 100,
    payment_type: "on-time",
    payment_date: "2026-04-30",
    created_at: "2026-09-01T09:05:00Z",
    ...over,
  }) as Payment;

describe("back-dated payments in the year strip", () => {
  it("shows a payment dated in a past month in that month's cell", () => {
    const debts = [debt()];
    const payments = [payment({ payment_date: "2026-04-30" })];

    // The regression: April predates the debt's created_at, and the strip used
    // to blank out every such month regardless of what was logged in it.
    expect(getStripMonthStatus(debts, payments, APR, YEAR)).toBe("paid");
  });

  it("leaves a past month with nothing logged blank, not missed", () => {
    // Nothing was owed before the debt existed, so an empty month here is not
    // a miss — a red cross would be wrong and unkind.
    expect(getStripMonthStatus([debt()], [], JAN, YEAR)).toBe("before-signup");
  });

  it("marks a back-dated payment short of the agreed amount as partial", () => {
    const payments = [payment({ amount: 40, payment_date: "2026-04-30" })];
    expect(getStripMonthStatus([debt()], payments, APR, YEAR)).toBe("partial");
  });

  it("counts only the month the payment is dated in", () => {
    const payments = [payment({ payment_date: "2026-04-30" })];
    expect(getStripMonthStatus([debt()], payments, APR, YEAR)).toBe("paid");
    expect(getStripMonthStatus([debt()], payments, AUG, YEAR)).toBe(
      "before-signup",
    );
  });

  it("does not treat other debts as missed in a back-filled month", () => {
    // Only one of two debts was back-filled for April. The other was not owed
    // anything then either, so April is still a good month, not a miss.
    const debts = [debt(), debt({ id: "debt-2", company: "Utility" })];
    const payments = [payment({ debt_id: "debt-1", payment_date: "2026-04-30" })];

    expect(getStripMonthStatus(debts, payments, APR, YEAR)).toBe("paid");
  });

  it("still shows the back-dated payment on that debt's own row", () => {
    const d = debt();
    const payments = [payment({ payment_date: "2026-04-30" })];

    expect(
      getDebtStripMonthStatus(
        d,
        payments,
        APR,
        YEAR,
        startOfMonth(d.created_at),
      ),
    ).toBe("paid");
  });
});

describe("months from the debt's own lifetime are unaffected", () => {
  const early = debt({ created_at: "2026-01-05T09:00:00Z" });

  it("still marks a genuinely missed month as missed", () => {
    expect(getStripMonthStatus([early], [], APR, YEAR)).toBe("missed");
  });

  it("still marks a paid month as paid", () => {
    const payments = [payment({ payment_date: "2026-04-15" })];
    expect(getStripMonthStatus([early], payments, APR, YEAR)).toBe("paid");
    // and agrees with the underlying per-month rule
    expect(getMonthStatus([early], payments, APR, YEAR)).toBe("paid");
  });

  it("keeps future months future", () => {
    expect(getStripMonthStatus([early], [], 11, YEAR)).toBe("future");
  });

  it("marks the current month current until something is logged", () => {
    expect(getStripMonthStatus([early], [], SEP, YEAR)).toBe("current");
  });

  it("shows the current month as paid once it is logged", () => {
    const payments = [payment({ payment_date: "2026-09-01" })];
    expect(getStripMonthStatus([early], payments, SEP, YEAR)).toBe("paid");
  });
});

describe("trackerStartMonth", () => {
  it("takes the earliest debt, not the first in the array", () => {
    const debts = [
      debt({ id: "a", created_at: "2026-06-10T00:00:00Z" }),
      debt({ id: "b", created_at: "2026-02-03T00:00:00Z" }),
    ];
    expect(trackerStartMonth(debts)).toEqual(new Date(2026, 1, 1));
  });

  it("is null with no debts", () => {
    expect(trackerStartMonth([])).toBeNull();
  });
});
