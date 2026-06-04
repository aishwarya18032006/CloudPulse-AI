import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineBanknotes,
  HiOutlineChartBar,
  HiOutlineBolt,
  HiOutlineGlobeAlt,
} from "react-icons/hi2";
import { StripeMetric } from "../ui/StripeMetric";
import { DashboardHero } from "../features/dashboard/DashboardHero";
import { InfrastructureTwin } from "../features/dashboard/InfrastructureTwin";
import { ForecastChart } from "../features/dashboard/ForecastChart";
import { ResourceDetection } from "../features/dashboard/ResourceDetection";
import { CarbonPanel } from "../features/dashboard/CarbonPanel";
import { RegionAdvisor } from "../features/dashboard/RegionAdvisor";
import { useCloud } from "../context/CloudContext";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { metrics, provider } = useCloud();
  const showSimulatorBack = provider === "demo" && metrics?.fromSimulator;

  return (
    <div className="min-w-0">
      {showSimulatorBack && (
        <button
          type="button"
          onClick={() => navigate("/simulator")}
          className="cp-btn-ghost mb-4 gap-2 text-sm font-semibold"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to Simulator
        </button>
      )}
      <DashboardHero metrics={metrics} />

      <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StripeMetric
          label="Current cost"
          value={metrics.monthlyCost}
          sparkData={metrics.sparkCost}
          icon={HiOutlineBanknotes}
          delay={0}
        />
        <StripeMetric
          label="Predicted cost"
          value={metrics.predictedCost}
          sparkData={metrics.sparkCost}
          trend={metrics.growth}
          trendLabel={`+${metrics.growth}%`}
          icon={HiOutlineChartBar}
          delay={0.05}
        />
        <StripeMetric
          label="Potential savings"
          value={metrics.savings}
          sparkData={metrics.sparkCost.map((v) => Math.round(v * 0.2))}
          trendLabel="Identified"
          icon={HiOutlineBolt}
          delay={0.1}
        />
        <StripeMetric
          label="Sustainability score"
          value={metrics.greenScore}
          format="number"
          suffix=" / 100"
          icon={HiOutlineGlobeAlt}
          delay={0.15}
        />
      </div>

      <div className="mb-10">
        <InfrastructureTwin metrics={metrics} />
      </div>

      <div className="mb-10">
        <ForecastChart metrics={metrics} />
      </div>

      <div className="mb-10 grid gap-6 xl:grid-cols-2">
        <ResourceDetection metrics={metrics} />
        <CarbonPanel metrics={metrics} />
      </div>

      <RegionAdvisor metrics={metrics} />
    </div>
  );
};
