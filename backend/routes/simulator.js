import { Router } from "express";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { runPrediction } from "../services/predictionEngine.js";
import { buildDashboardMetrics } from "../services/simulatorMetrics.js";
import { generateChatReply, isGeminiConfigured } from "../services/gemini/index.js";

const router = Router();

const FALLBACK_RECOMMENDATIONS = (inputs, prediction) =>
  [
    `Review ${inputs.vmCount || 0} VMs in ${inputs.region || "your region"} — utilization suggests ${prediction.riskLevel.toLowerCase()} optimization risk.`,
    `Potential monthly savings of approximately ₹${prediction.savingsPotential.toLocaleString("en-IN")} via rightsizing and idle resource reclamation.`,
    `Carbon score ${prediction.carbonScore}/100 — consider shifting bursty workloads to ${inputs.cloudProvider === "gcp" ? "GCP" : inputs.cloudProvider === "azure" ? "Azure" : "AWS"} lower-carbon regions.`,
    `Forecasted spend ₹${prediction.predictedCost.toLocaleString("en-IN")} (+${prediction.growthPct}%) — enable reserved capacity or savings plans where applicable.`,
  ].join("\n\n");

function buildGeminiPrompt(inputs, prediction) {
  return `You are CloudPulse AI. Based on these cloud infrastructure metrics, provide 4 concise, actionable FinOps and sustainability recommendations (bullet points, plain text, no markdown headers).

Cloud Provider: ${inputs.cloudProvider}
Region: ${inputs.region}
VMs: ${inputs.vmCount} x ${inputs.vmType}
CPU: ${inputs.cpuUsage}% | Memory: ${inputs.memoryUsage}% | Storage: ${inputs.storageUsage}%
Network: ${inputs.networkTrafficGb} GB | Monthly cost: $${inputs.monthlyCost}
Energy: ${inputs.energyKwh} kWh | Carbon: ${inputs.carbonKg} kg CO₂
Application: ${inputs.applicationType} | DAU: ${inputs.dailyActiveUsers} | Requests: ${inputs.requestVolume}

Model outputs:
- Predicted cost: $${prediction.predictedCost}
- Risk score: ${prediction.riskScore}/100 (${prediction.riskLevel})
- Carbon score: ${prediction.carbonScore}/100
- Savings potential: $${prediction.savingsPotential}`;
}

router.post("/analyze", optionalAuth, async (req, res) => {
  const inputs = req.body ?? {};

  const required = [
    "cloudProvider",
    "region",
    "vmCount",
    "vmType",
    "cpuUsage",
    "memoryUsage",
    "storageUsage",
    "networkTrafficGb",
    "monthlyCost",
    "energyKwh",
    "carbonKg",
    "applicationType",
    "dailyActiveUsers",
    "requestVolume",
  ];

  const missing = required.filter((k) => inputs[k] === undefined || inputs[k] === "");
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
  }

  const { featureVector, prediction } = runPrediction(inputs);

  let recommendations = FALLBACK_RECOMMENDATIONS(inputs, prediction);

  if (isGeminiConfigured()) {
    try {
      const { reply } = await generateChatReply(buildGeminiPrompt(inputs, prediction), []);
      if (reply?.trim()) recommendations = reply.trim();
    } catch (err) {
      console.warn("[Simulator] Gemini recommendations fallback:", err.message);
    }
  }

  const metrics = buildDashboardMetrics(
    { ...inputs, _recommendations: recommendations },
    prediction
  );

  return res.json({
    featureVector,
    prediction: {
      predictedCost: prediction.predictedCost,
      riskScore: prediction.riskScore,
      carbonScore: prediction.carbonScore,
      savingsPotential: prediction.savingsPotential,
      riskLevel: prediction.riskLevel,
      growthPct: prediction.growthPct,
    },
    recommendations,
    metrics,
  });
});

export default router;
