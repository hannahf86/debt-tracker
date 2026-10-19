import type { Debt, Payment } from "@/lib/types";

/**
 * The certificate for a debt that's gone.
 *
 * Two jobs live here: working out what it says, and drawing it onto a canvas
 * so it can be saved as a picture. The on-screen version in
 * components/Certificate.tsx renders the same words as ordinary HTML, so what
 * somebody sees and what they download agree.
 *
 * Canvas rather than jsPDF, which can't render a colour emoji and would fight
 * the rounded corners.
 */

export type CertificateData = {
  /** "Barclaycard: gone." or "One debt: gone." depending on the preference. */
  headline: string;
  eyebrow: string;
  body: string;
  startedLabel: string;
  paymentCount: number;
  /** Null when figures are hidden. */
  paidOff: number | null;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const monthYear = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const money = (n: number) =>
  `£${Math.round(n).toLocaleString("en-GB")}`;

export function buildCertificate(
  debt: Debt,
  payments: Payment[],
  showDetails: boolean,
): CertificateData {
  const mine = payments
    .filter((p) => p.debt_id === debt.id)
    .sort((a, b) => a.payment_date.localeCompare(b.payment_date));

  const first = mine[0]?.payment_date
    ? new Date(mine[0].payment_date)
    : new Date(debt.created_at);
  const last = mine[mine.length - 1]?.payment_date
    ? new Date(mine[mine.length - 1].payment_date)
    : new Date();

  const paidOff = debt.total_amount;
  /* Inclusive: April to September is six months of showing up, not five.
     Counting the gap would say seventeen where there are eighteen payments. */
  const months = Math.max(
    1,
    (last.getFullYear() - first.getFullYear()) * 12 +
      (last.getMonth() - first.getMonth()) +
      1,
  );

  /* The emotional line is the point of the whole thing, so it says what it
     felt like rather than congratulating anybody on a journey. The last
     sentence turns it forward: the monthly payment is theirs again, which is
     the part people don't think about until somebody says it. */
  const showingUp = `${months} month${months === 1 ? "" : "s"} of showing up`;
  const freedUp =
    showDetails && debt.monthly_amount
      ? ` That's ${money(debt.monthly_amount)} a month back in your pocket.`
      : "";
  const body = showDetails
    ? `${money(paidOff)} paid off, ${showingUp}. You did that. It no longer takes up space in your head.${freedUp}`
    : `${showingUp}. You did that. It no longer takes up space in your head.`;

  return {
    headline: showDetails ? `${debt.company}: gone.` : "One debt: gone.",
    eyebrow: `ONE DOWN · ${monthYear(last).toUpperCase()}`,
    body,
    startedLabel: monthYear(first),
    paymentCount: mine.length,
    paidOff: showDetails ? paidOff : null,
  };
}

/** Alt text, written for them. Nobody should have to describe their own win. */
export function certificateAlt(data: CertificateData): string {
  return `A Mirian certificate reading "${data.headline}" ${data.body}`;
}

/* ---------- drawing ---------- */

const INK = "#12282b";
const MUTED = "#4a6a6d";
const TEAL = "#1a666a";
const PAPER = "#ffffff";
const LINE = "#dbe8e8";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Wrap at a width, returning the lines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Draw the certificate at 2000x1418, which is A4 landscape, so it prints
 * without cropping.
 */
export async function drawCertificate(
  canvas: HTMLCanvasElement,
  data: CertificateData,
) {
  const W = 2000;
  const H = 1418;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // The app's own typeface, which has to be loaded before it can be drawn.
  try {
    await Promise.all([
      document.fonts.load('700 120px "Atkinson Hyperlegible"'),
      document.fonts.load('400 40px "Atkinson Hyperlegible"'),
      document.fonts.load('800 120px "Nunito"'),
    ]);
  } catch {
    // Fall back to whatever the system has rather than drawing nothing.
  }

  const display = '"Nunito", "Atkinson Hyperlegible", system-ui, sans-serif';
  const body = '"Atkinson Hyperlegible", system-ui, sans-serif';

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const M = 130;

  // Logo: the mark, then the name.
  const markSize = 76;
  ctx.fillStyle = TEAL;
  roundedRect(ctx, M, 108, markSize, markSize, 22);
  ctx.fill();
  ctx.fillStyle = PAPER;
  const u = markSize / 64;
  [
    [14, 18, 36],
    [14, 30, 26],
    [14, 42, 14],
  ].forEach(([bx, by, bw], i) => {
    ctx.globalAlpha = [1, 0.78, 0.56][i];
    roundedRect(ctx, M + bx * u, 108 + by * u, bw * u, 8 * u, 4 * u);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle = TEAL;
  ctx.font = `800 54px ${display}`;
  ctx.textBaseline = "middle";
  ctx.fillText("Mirian", M + markSize + 24, 108 + markSize / 2 + 2);

  // The three bars, top right: a balance coming down.
  const barX = W - M;
  [
    [400, 0.25],
    [270, 0.55],
    [150, 1],
  ].forEach(([len, alpha], i) => {
    ctx.globalAlpha = alpha as number;
    ctx.fillStyle = TEAL;
    roundedRect(ctx, barX - (len as number), 120 + i * 86, len as number, 56, 28);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  ctx.textBaseline = "alphabetic";

  // Eyebrow
  ctx.fillStyle = TEAL;
  ctx.font = `700 30px ${body}`;
  ctx.letterSpacing = "3px";
  ctx.fillText(data.eyebrow, M, 420);
  ctx.letterSpacing = "0px";

  // Headline, wrapped
  ctx.fillStyle = INK;
  ctx.font = `800 148px ${display}`;
  let y = 560;
  for (const line of wrap(ctx, data.headline, W - M * 2 - 420)) {
    ctx.fillText(line, M, y);
    y += 168;
  }

  // Body
  ctx.fillStyle = MUTED;
  ctx.font = `400 46px ${body}`;
  y += 40;
  for (const line of wrap(ctx, data.body, W - M * 2 - 300)) {
    ctx.fillText(line, M, y);
    y += 68;
  }

  // The rule and the figures along the bottom
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(M, H - 230);
  ctx.lineTo(W - M, H - 230);
  ctx.stroke();

  const stats: [string, string][] = [
    ["STARTED", data.startedLabel],
    ["PAYMENTS", String(data.paymentCount)],
  ];
  if (data.paidOff !== null) stats.push(["PAID OFF", money(data.paidOff)]);
  stats.push(["STILL OWED", "£0"]);

  let x = M;
  for (const [label, value] of stats) {
    ctx.fillStyle = MUTED;
    ctx.font = `700 26px ${body}`;
    ctx.letterSpacing = "2px";
    ctx.fillText(label, x, H - 160);
    ctx.letterSpacing = "0px";
    ctx.fillStyle = INK;
    ctx.font = `800 54px ${display}`;
    ctx.fillText(value, x, H - 100);
    x += Math.max(300, ctx.measureText(value).width + 160);
  }

  ctx.fillStyle = MUTED;
  ctx.font = `400 30px ${body}`;
  const credit = "Tracked with Mirian";
  ctx.fillText(credit, W - M - ctx.measureText(credit).width, H - 100);
}
