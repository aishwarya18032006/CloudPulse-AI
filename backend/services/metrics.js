/** Server-side metrics generation for reports (mirrors frontend demo logic) */

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const REGIONS = {
  aws: { current: "AWS Mumbai (ap-south-1)", recommended: "AWS Singapore (ap-southeast-1)" },
  azure: { current: "Azure Central India", recommended: "Azure Southeast Asia" },
  gcp: { current: "GCP Mumbai (asia-south1)", recommended: "GCP Singapore (asia-southeast1)" },
  demo: { current: "AWS Mumbai (ap-south-1)", recommended: "AWS Singapore (ap-southeast-1)" },
};

export const generateReportMetrics = (cloudType = "demo") => {
  const monthlyCost = randomInRange(18000, 32000);
  const predictedCost = Math.round(monthlyCost * (1 + randomInRange(15, 35) / 100));
  const savings = randomInRange(4000, 8000);
  const greenScore = randomInRange(78, 96);
  const carbon = randomInRange(110, 190);
  const idleVm = randomInRange(1, 6);
  const unusedStorage = randomInRange(80, 200);
  const growth = Math.round(((predictedCost - monthlyCost) / monthlyCost) * 100);
  const regions = REGIONS[cloudType] || REGIONS.demo;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const costHistory = months.map((month, i) => ({
    month,
    cost: Math.round(monthlyCost * (0.75 + i * 0.05 + Math.random() * 0.08)),
  }));
  costHistory[costHistory.length - 1].cost = monthlyCost;

  return {
    monthlyCost,
    predictedCost,
    savings,
    greenScore,
    carbon,
    idleVm,
    unusedStorage,
    growth,
    region: regions,
    costSaving: randomInRange(2500, 4500),
    carbonReduction: randomInRange(14, 24),
    efficiencyIncrease: randomInRange(10, 20),
    currentInfra: {
      vms: randomInRange(9, 12),
      storage: randomInRange(380, 720),
      cost: monthlyCost,
    },
    optimizedInfra: {
      vms: randomInRange(6, 8),
      storage: Math.round(randomInRange(380, 720) * 0.68),
      cost: monthlyCost - savings,
    },
    costHistory,
    aiConfidence: randomInRange(92, 99),
  };
};

export const cloudLabel = (type) =>
  ({
    aws: "Amazon Web Services",
    azure: "Microsoft Azure",
    gcp: "Google Cloud",
    demo: "Demo Mode",
  })[type] || type;
