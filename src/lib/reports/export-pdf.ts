import type { Report } from "@/lib/domain/types";

export async function exportReportPdf(report: Report) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = 56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(report.title, margin, y);
  y += 34;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Het Leerinstituut · gespreksklaar rapport · geen docent-ranking", margin, y);
  y += 30;

  report.blocks.forEach((block) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(block.title, margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(block.content, 500) as string[];
    lines.forEach((line) => {
      if (y > 760) {
        doc.addPage();
        y = 56;
      }
      doc.text(line, margin, y);
      y += 15;
    });
    y += 18;
  });

  doc.save(`${report.title.toLowerCase().replaceAll(" ", "-")}.pdf`);
}
