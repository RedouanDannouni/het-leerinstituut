import type { Report } from "@/lib/domain/types";

export async function exportReportPptx(report: Report) {
  const pptxgen = (await import("pptxgenjs")).default;
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Het Leerinstituut";
  pptx.subject = "Gespreksklaar rapport";
  pptx.title = report.title;

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "F8FAF9" };
  titleSlide.addText("Het Leerinstituut", { x: 0.6, y: 0.5, w: 4, h: 0.3, fontSize: 12, bold: true, color: "6B7C76" });
  titleSlide.addText(report.title, { x: 0.6, y: 1.4, w: 10.5, h: 0.8, fontSize: 30, bold: true, color: "12201B" });
  titleSlide.addText("Gespreksklaar rapport · geaggregeerd · geen docent-ranking", { x: 0.6, y: 2.35, w: 10, h: 0.4, fontSize: 14, color: "31413C" });

  report.blocks.forEach((block) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addText(block.title, { x: 0.6, y: 0.5, w: 11, h: 0.4, fontSize: 22, bold: true, color: "12201B" });
    slide.addText(block.content, { x: 0.8, y: 1.3, w: 11, h: 4.8, fontSize: 15, color: "31413C", breakLine: false, fit: "shrink" });
  });

  await pptx.writeFile({ fileName: `${report.title.toLowerCase().replaceAll(" ", "-")}.pptx` });
}
