/**
 * CloudPulse prediction engine — structured for future XGBoost model integration.
 *
 * Production path: feature vectors are built from live telemetry pulled via
 * - AWS APIs (Cost Explorer, CloudWatch, EC2, etc.)
 * - Azure APIs (Cost Management, Monitor, Resource Graph)
 * - GCP APIs (Billing, Monitoring, Compute)
 *
 * Demo/simulator path: the same feature vector is built from manual form inputs
 * until cloud provider connectors populate these fields automatically.
 */

const PROVIDER_INDEX = { aws: 0, azure: 1, gcp: 2 };

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const parseNum = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Normalized feature vector — pass directly to XGBoost predict() when the model is deployed.
 * @param {Record<string, unknown>} inputs
 * @returns {number[]}
 */
export function buildFeatureVector(inputs) {
  const provider = String(inputs.cloudProvider || "aws").toLowerCase();
  const providerIdx = PROVIDER_INDEX[provider] ?? 0;

  return [
    parseNum(inputs.vmCount, 1),
    parseNum(inputs.cpuUsage, 50) / 100,
    parseNum(inputs.memoryUsage, 50) / 100,
    parseNum(inputs.storageUsage, 50) / 100,
    parseNum(inputs.networkTrafficGb, 10),
    parseNum(inputs.monthlyCost, 1000),
    parseNum(inputs.energyKwh, 100),
    parseNum(inputs.carbonKg, 50),
    parseNum(inputs.dailyActiveUsers, 1000),
    parseNum(inputs.requestVolume, 10000),
    providerIdx === 0 ? 1 : 0,
    providerIdx === 1 ? 1 : 0,
    providerIdx === 2 ? 1 : 0,
  ];
}

/**
 * Heuristic inference stand-in for XGBoost.predict(featureVector).
 * Replace the body of this function with model inference when weights are available.
 */
export function predictFromFeatures(featureVector, inputs = {}) {
  const [
    vmCount,
    cpuNorm,
    memoryNorm,
    storageNorm,
    networkGb,
    monthlyCost,
    energyKwh,
    carbonKg,
  ] = featureVector;

  const avgUtil = (cpuNorm + memoryNorm + storageNorm) / 3;
  const overProvision = clamp(1 - avgUtil, 0, 0.55);
  const growthPct = clamp(
    Math.round(8 + overProvision * 35 + (networkGb > 500 ? 12 : networkGb > 100 ? 6 : 0)),
    5,
    45
  );

  const predictedCost = Math.round(monthlyCost * (1 + growthPct / 100));
  const savingsPotential = Math.round(
    monthlyCost * (0.08 + overProvision * 0.22) + vmCount * 180
  );

  let riskScore = Math.round(
    28 +
      overProvision * 42 +
      (cpuNorm > 0.85 ? 18 : 0) +
      (memoryNorm > 0.88 ? 14 : 0) +
      (vmCount > 14 ? 10 : 0)
  );
  riskScore = clamp(riskScore, 12, 96);

  const carbonIntensity = carbonKg / Math.max(energyKwh, 1);
  const carbonScore = clamp(
    Math.round(100 - carbonIntensity * 18 - storageNorm * 12 - (1 - avgUtil) * 8),
    35,
    99
  );

  const riskLevel = riskScore >= 70 ? "High" : riskScore >= 45 ? "Medium" : "Low";
  const idleVm = Math.max(0, Math.round(vmCount * overProvision * 0.35));

  return {
    predictedCost,
    riskScore,
    carbonScore,
    savingsPotential,
    growthPct,
    riskLevel,
    idleVm,
    overProvision,
    inputs,
  };
}

export function runPrediction(inputs) {
  const featureVector = buildFeatureVector(inputs);
  const prediction = predictFromFeatures(featureVector, inputs);
  return { featureVector, prediction };
}
