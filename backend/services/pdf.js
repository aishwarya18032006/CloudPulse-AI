import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { cloudLabel } from "./metrics.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, "..", "uploads", "reports");

fs.mkdirSync(REPORTS_DIR, { recursive: true });

const formatCurrency = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const drawBarChart = (doc, data, x, y, width, height) => {
  const max = Math.max(...data.map((d) => d.cost), 1);
  const barW = width / data.length - 8;
  data.forEach((d, i) => {
    const barH = (d.cost / max) * (height - 24);
    const bx = x + i * (barW + 8);
    const by = y + height - barH - 20;
    doc.rect(bx, by, barW, barH).fill("#2563eb");
    doc.fillColor("#64748b").fontSize(8).text(d.month, bx, y + height - 14, { width: barW, align: "center" });
  });
  doc.fillColor("#0c0d12");
};

export const generateReportPdf = async ({ userId, cloudType, startDate, endDate, metrics }) => {
  const filename = `report-${userId}-${Date.now()}.pdf`;
  const filepath = path.join(REPORTS_DIR, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fillColor("#2563eb").fontSize(22).font("Helvetica-Bold").text("CloudPulse AI Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fillColor("#64748b").fontSize(11).font("Helvetica").text("Enterprise Cloud Intelligence", { align: "center" });
    doc.moveDown(1.5);

    doc.fillColor("#0c0d12").fontSize(10);
    doc.text(`Cloud Provider: ${cloudLabel(cloudType)}`);
    doc.text(`Date Range: ${startDate} — ${endDate}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(1);

    // KPI section
    doc.font("Helvetica-Bold").fontSize(14).text("Executive Summary");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(11);

    const kpis = [
      ["Current Cost", formatCurrency(metrics.monthlyCost)],
      ["Predicted Cost", formatCurrency(metrics.predictedCost)],
      ["Potential Savings", formatCurrency(metrics.savings)],
      ["Sustainability Score", `${metrics.greenScore} / 100`],
      ["Carbon Footprint", `${metrics.carbon} kg CO₂`],
      ["Idle Resources", `${metrics.idleVm} VMs · ${metrics.unusedStorage}GB storage`],
    ];

    kpis.forEach(([label, value]) => {
      doc.fillColor("#64748b").text(label, { continued: true });
      doc.fillColor("#0c0d12").text(`  ${value}`);
    });

    doc.moveDown(1);

    // Green region
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#0c0d12").text("Green Region Recommendation");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(11);
    doc.text(`Current: ${metrics.region.current}`);
    doc.text(`Recommended: ${metrics.region.recommended}`);
    doc.text(`Est. Savings: ${formatCurrency(metrics.costSaving)} · Carbon reduction: ${metrics.carbonReduction}%`);
    doc.moveDown(1);

    // Digital twin
    doc.font("Helvetica-Bold").fontSize(14).text("Digital Twin Summary");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(11);
    doc.text(
      `Before: ${metrics.currentInfra.vms} VMs, ${metrics.currentInfra.storage}GB, ${formatCurrency(metrics.currentInfra.cost)}/mo`
    );
    doc.text(
      `After:  ${metrics.optimizedInfra.vms} VMs, ${metrics.optimizedInfra.storage}GB, ${formatCurrency(metrics.optimizedInfra.cost)}/mo`
    );
    doc.text(`Efficiency gain: +${metrics.efficiencyIncrease}% · AI confidence: ${metrics.aiConfidence}%`);
    doc.moveDown(1);

    // Chart
    if (metrics.costHistory?.length) {
      doc.font("Helvetica-Bold").fontSize(14).text("Cost Analytics");
      doc.moveDown(0.5);
      const chartY = doc.y;
      drawBarChart(doc, metrics.costHistory, 50, chartY, 495, 100);
      doc.y = chartY + 110;
    }

    doc.moveDown(2);
    doc.fillColor("#94a3b8").fontSize(9).text("Confidential — CloudPulse AI · For internal use only", { align: "center" });

    doc.end();

    stream.on("finish", () => resolve({ filepath, filename }));
    stream.on("error", reject);
  });
};

export const getReportFilePath = (filename) => path.join(REPORTS_DIR, filename);

export { REPORTS_DIR };
