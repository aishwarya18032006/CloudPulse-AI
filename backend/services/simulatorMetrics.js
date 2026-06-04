/**
 * Maps simulator inputs + prediction outputs into the dashboard metrics shape
 * consumed by the existing CloudPulse UI (charts, twin, carbon panel, etc.).
 *
 * In production, this builder will receive normalized payloads from AWS/Azure/GCP
 * API collectors instead of manual form submissions.
 */

import {
  normalizeSimulatorInputs,
  storageGbFromUsagePercent,
  networkUtilizationFromGb,
} from "./simulatorInputs.js";

const REGION_PRESETS = {
  aws: { recommended: "AWS Singapore (ap-southeast-1)" },
  azure: { recommended: "Azure Southeast Asia" },
  gcp: { recommended: "GCP Singapore (asia-southeast1)" },
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function buildDashboardMetrics(inputs, prediction) {
  const user = normalizeSimulatorInputs(inputs);
  const provider = user.cloudProvider;

  const monthlyCost = user.monthlyCost;
  const predictedCost = prediction.predictedCost;
  const savings = prediction.savingsPotential;
  const growth = prediction.growthPct;
  const vmCount = user.vmCount;
  const carbon = user.carbonKg;
  const storageGb = storageGbFromUsagePercent(user.storageUsage);
  const unusedStorage = Math.round(storageGb * prediction.overProvision * 0.35);
  const optimizedVms = Math.max(1, vmCount - prediction.idleVm);
  const optimizedStorage = Math.round(storageGb * (0.62 + (1 - prediction.overProvision) * 0.15));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const sparkCost = months.map((_, i) =>
    Math.round(monthlyCost * (0.82 + i * 0.03))
  );
  sparkCost[sparkCost.length - 1] = monthlyCost;

  const costHistory = months.map((month, i) => ({
    month,
    cost: Math.round(monthlyCost * (0.75 + i * 0.05)),
    predicted: null,
  }));
  costHistory[costHistory.length - 1].cost = monthlyCost;
  costHistory.push({ month: "Jul", cost: null, predicted: predictedCost });

  const carbonHistory = months.map((month) => ({
    month,
    carbon,
  }));

  const preset = REGION_PRESETS[provider] || REGION_PRESETS.aws;

  const healthScore = clamp(
    Math.round(62 + prediction.carbonScore * 0.28 - prediction.riskScore * 0.12),
    58,
    99
  );

  return {
    monthlyCost,
    predictedCost,
    savings,
    greenScore: prediction.carbonScore,
    cpu: user.cpuUsage,
    memory: user.memoryUsage,
    storage: storageGb,
    storageUsage: user.storageUsage,
    carbon,
    energyKwh: user.energyKwh,
    vmCount,
    networkTrafficGb: user.networkTrafficGb,
    vmType: user.vmType,
    idleVm: prediction.idleVm,
    unusedStorage,
    growth,
    sparkCost,
    overProvisionedDb: prediction.riskLevel === "High" ? 2 : 1,
    riskLevel: prediction.riskLevel,
    aiConfidence: clamp(100 - Math.round(prediction.riskScore * 0.08), 88, 99),
    costHistory,
    carbonHistory,
    region: {
      current: user.region || "Custom region",
      recommended: preset.recommended,
    },
    costSaving: Math.round(savings * 0.55),
    carbonReduction: clamp(Math.round(12 + prediction.overProvision * 18), 10, 32),
    efficiencyIncrease: clamp(Math.round(8 + prediction.overProvision * 14), 8, 28),
    currentInfra: {
      vms: vmCount,
      storage: storageGb,
      cost: monthlyCost,
    },
    optimizedInfra: {
      vms: optimizedVms,
      storage: optimizedStorage,
      cost: Math.max(monthlyCost - savings, Math.round(monthlyCost * 0.72)),
    },
    utilization: {
      compute: user.cpuUsage,
      memory: user.memoryUsage,
      storage: user.storageUsage,
      network: networkUtilizationFromGb(user.networkTrafficGb),
    },
    healthScore,
    healthStatus:
      healthScore >= 90 ? "Excellent" : healthScore >= 75 ? "Good" : "Fair",
    fromSimulator: true,
    simulatorInputs: user,
    predictionSummary: {
      predictedCost,
      riskScore: prediction.riskScore,
      carbonScore: prediction.carbonScore,
      savingsPotential: prediction.savingsPotential,
    },
    aiRecommendations: inputs._recommendations || null,
  };
}
