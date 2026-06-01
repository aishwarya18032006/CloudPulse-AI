import { randomInRange } from "./formatters";

const REGIONS = {
  aws: { current: "AWS Mumbai (ap-south-1)", recommended: "AWS Singapore (ap-southeast-1)" },
  azure: { current: "Azure Central India", recommended: "Azure Southeast Asia" },
  gcp: { current: "GCP Mumbai (asia-south1)", recommended: "GCP Singapore (asia-southeast1)" },
  demo: { current: "AWS Mumbai (ap-south-1)", recommended: "AWS Singapore (ap-southeast-1)" },
};

export const generateMetrics = (provider = "demo") => {
  const monthlyCost = randomInRange(18000, 32000);
  const predictedCost = Math.round(monthlyCost * (1 + randomInRange(15, 35) / 100));
  const savings = randomInRange(4000, 8000);
  const greenScore = randomInRange(78, 96);
  const cpu = randomInRange(55, 88);
  const memory = randomInRange(50, 85);
  const storage = randomInRange(380, 720);
  const carbon = randomInRange(110, 190);
  const idleVm = randomInRange(1, 6);
  const unusedStorage = randomInRange(80, 200);
  const growth = Math.round(((predictedCost - monthlyCost) / monthlyCost) * 100);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const sparkCost = months.slice(-7).map((_, i) =>
    Math.round(monthlyCost * (0.82 + i * 0.03 + Math.random() * 0.05))
  );
  sparkCost[sparkCost.length - 1] = monthlyCost;

  const costHistory = months.map((month, i) => ({
    month,
    cost: Math.round(monthlyCost * (0.75 + i * 0.05 + Math.random() * 0.08)),
    predicted: null,
  }));
  costHistory[costHistory.length - 1].cost = monthlyCost;
  costHistory.push({ month: "Jul", cost: null, predicted: predictedCost });

  const carbonHistory = months.map((month) => ({
    month,
    carbon: randomInRange(100, 180),
  }));

  const regions = REGIONS[provider] || REGIONS.demo;

  return {
    monthlyCost,
    predictedCost,
    savings,
    greenScore,
    cpu,
    memory,
    storage,
    carbon,
    idleVm,
    unusedStorage,
    growth,
    sparkCost,
    overProvisionedDb: randomInRange(1, 2),
    riskLevel: idleVm > 3 ? "High" : idleVm > 1 ? "Medium" : "Low",
    aiConfidence: randomInRange(92, 99),
    costHistory,
    carbonHistory,
    region: regions,
    costSaving: randomInRange(2500, 4500),
    carbonReduction: randomInRange(14, 24),
    efficiencyIncrease: randomInRange(10, 20),
    currentInfra: {
      vms: randomInRange(9, 12),
      storage,
      cost: monthlyCost,
    },
    optimizedInfra: {
      vms: randomInRange(6, 8),
      storage: Math.round(storage * 0.68),
      cost: monthlyCost - savings,
    },
    utilization: {
      compute: cpu,
      memory,
      storage: randomInRange(62, 88),
      network: randomInRange(48, 78),
    },
    healthScore: randomInRange(84, 97),
    healthStatus: "Excellent",
  };
};

export const ENVIRONMENTS = [
  {
    id: "aws",
    name: "Amazon Web Services",
    short: "AWS",
    brandColor: "#FF9900",
    features: ["Cloud Spend Analysis", "Cost Forecasting", "Carbon Tracking"],
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    short: "Azure",
    brandColor: "#0078D4",
    features: ["Resource Optimization", "Sustainability Monitoring", "AI Insights"],
  },
  {
    id: "gcp",
    name: "Google Cloud",
    short: "Google Cloud",
    brandColor: "#4285F4",
    features: ["Cloud Analytics", "Resource Intelligence", "Carbon Efficiency"],
  },
  {
    id: "demo",
    name: "Demo Environment",
    short: "Demo Mode",
    brandColor: "#7C3AED",
    badge: "No account required",
    features: ["Experience Full Platform", "No Cloud Account Required", "Live sample data"],
  },
];
