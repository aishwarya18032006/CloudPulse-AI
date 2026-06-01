import { Router } from "express";
import fs from "fs";
import path from "path";
import pool from "../database/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { generateReportMetrics, cloudLabel } from "../services/metrics.js";
import { generateReportPdf, getReportFilePath } from "../services/pdf.js";

const router = Router();

const VALID_CLOUDS = ["aws", "azure", "gcp", "demo"];

router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate, cloudType } = req.body;

    if (!startDate || !endDate || !cloudType) {
      return res.status(400).json({ error: "Start date, end date, and cloud provider are required." });
    }

    if (!VALID_CLOUDS.includes(cloudType)) {
      return res.status(400).json({ error: "Invalid cloud provider." });
    }

    const metrics = generateReportMetrics(cloudType);
    const { filepath, filename } = await generateReportPdf({
      userId: req.user.id,
      cloudType,
      startDate,
      endDate,
      metrics,
    });

    const relativePath = path.join("reports", filename);
    const result = await pool.query(
      `INSERT INTO reports (user_id, cloud_type, start_date, end_date, report_path, metrics_json)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, cloud_type, start_date, end_date, report_path, generated_at`,
      [req.user.id, cloudType, startDate, endDate, relativePath, JSON.stringify(metrics)]
    );

    res.status(201).json({
      report: result.rows[0],
      metrics,
      cloudLabel: cloudLabel(cloudType),
      downloadUrl: `/api/reports/${result.rows[0].id}/download`,
    });
  } catch (err) {
    console.error("Generate report error:", err);
    res.status(500).json({ error: "Failed to generate report." });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, cloud_type, start_date, end_date, report_path, generated_at
       FROM reports WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ reports: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch report history." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT report_path FROM reports WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found." });
    }

    const filename = path.basename(result.rows[0].report_path);
    const filepath = getReportFilePath(filename);

    await pool.query(`DELETE FROM reports WHERE id = $1 AND user_id = $2`, [
      req.params.id,
      req.user.id,
    ]);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Delete report error:", err);
    res.status(500).json({ error: "Failed to delete report." });
  }
});

router.get("/:id/download", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT report_path FROM reports WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found." });
    }

    const filename = path.basename(result.rows[0].report_path);
    const filepath = getReportFilePath(filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "Report file missing." });
    }

    res.download(filepath, `cloudpulse-report-${req.params.id}.pdf`);
  } catch (err) {
    res.status(500).json({ error: "Download failed." });
  }
});

export default router;
