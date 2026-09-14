/**
 * Turns a message into a printable A4 letter and downloads it.
 *
 * jsPDF is loaded only when someone actually asks for a letter, so it adds
 * nothing to the page for everyone else.
 */

type Letter = {
  yourName: string;
  company: string;
  subject: string;
  body: string;
};

const PAGE_HEIGHT = 297;
const MARGIN = 22;
const LINE = 5.6;

function fileName(company: string): string {
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return `${slug || "letter"}-letter-${date}.pdf`;
}

export async function downloadLetter({ yourName, company, subject, body }: Letter) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth() - MARGIN * 2;
  let y = MARGIN;

  const write = (text: string, gapAfter = 0) => {
    for (const line of doc.splitTextToSize(text, width) as string[]) {
      if (y > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y);
      y += LINE;
    }
    y += gapAfter;
  };

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  // Sender and date, top of the letter
  if (yourName) write(yourName);
  write(
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    LINE,
  );

  // Recipient
  write(company, LINE);

  // Subject line
  if (subject.trim()) {
    doc.setFont("helvetica", "bold");
    write(subject.trim(), LINE * 0.6);
    doc.setFont("helvetica", "normal");
  }

  // Body, keeping the blank lines between paragraphs
  for (const paragraph of body.replace(/\r\n/g, "\n").split("\n")) {
    if (paragraph.trim()) write(paragraph);
    else y += LINE;
  }

  doc.save(fileName(company));
}
