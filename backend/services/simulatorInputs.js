/** Canonical user-entered values — source of truth for dashboard display */
export function normalizeSimulatorInputs(inputs = {}) {
  return {
    cloudProvider: String(inputs.cloudProvider || "aws").toLowerCase(),
    region: String(inputs.region || "").trim(),
    vmCount: Math.round(Number(inputs.vmCount) || 0),
    vmType: String(inputs.vmType || "").trim(),
    cpuUsage: Math.round(Number(inputs.cpuUsage) || 0),
    memoryUsage: Math.round(Number(inputs.memoryUsage) || 0),
    storageUsage: Math.round(Number(inputs.storageUsage) || 0),
    networkTrafficGb: Math.round(Number(inputs.networkTrafficGb) || 0),
    monthlyCost: Math.round(Number(inputs.monthlyCost) || 0),
    energyKwh: Math.round(Number(inputs.energyKwh) || 0),
    carbonKg: Math.round(Number(inputs.carbonKg) || 0),
    applicationType: String(inputs.applicationType || "").trim(),
    dailyActiveUsers: Math.round(Number(inputs.dailyActiveUsers) || 0),
    requestVolume: Math.round(Number(inputs.requestVolume) || 0),
  };
}

export function storageGbFromUsagePercent(storageUsage) {
  return Math.round(Number(storageUsage) * 10);
}

export function networkUtilizationFromGb(networkTrafficGb) {
  const gb = Number(networkTrafficGb) || 0;
  return Math.min(100, Math.max(0, Math.round(gb / 5)));
}
