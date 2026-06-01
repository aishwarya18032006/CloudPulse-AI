const knowledge = [
  {
    keywords: ["ai cost prediction", "cost prediction", "forecast", "predict"],
    answer:
      "AI Cost Prediction analyzes historical cloud spend using machine learning to forecast next month's bill. It shows current vs predicted cost, growth percentage, and an AI confidence score — helping FinOps teams plan budgets before overruns occur.",
  },
  {
    keywords: ["idle resource", "idle detection", "unused vm", "unused"],
    answer:
      "Idle Resource Detection scans your environment for underutilized VMs, unattached storage, and over-provisioned databases. Each finding includes a risk level (Low/Medium/High) and actionable recommendations to reclaim waste.",
  },
  {
    keywords: ["carbon footprint", "carbon", "co2", "emissions"],
    answer:
      "Carbon Footprint tracks monthly CO₂ emissions from your cloud workloads based on region energy mix, compute hours, and storage. It appears in Carbon Intelligence alongside a monthly trend chart.",
  },
  {
    keywords: ["sustainability score", "green score", "sustainability"],
    answer:
      "Sustainability Score (0–100) measures how efficiently your infrastructure runs relative to carbon output. A higher score means better utilization with lower environmental impact — ideal for ESG reporting.",
  },
  {
    keywords: ["green region", "migration", "region migration"],
    answer:
      "Green Region Migration Advisor compares your current region with AI-recommended alternatives, showing estimated cost savings, carbon reduction %, and efficiency gains before you migrate workloads.",
  },
  {
    keywords: ["digital twin", "twin", "optimized infrastructure"],
    answer:
      "Cloud Efficiency Digital Twin simulates an optimized version of your infrastructure side-by-side: VMs, storage, monthly cost, carbon saved, and efficiency increase — so you can visualize FinOps impact before making changes.",
  },
  {
    keywords: ["report", "pdf", "generate report", "export"],
    answer:
      "Report Generation lets you select a date range and cloud provider (AWS, Azure, Google Cloud, or Demo), then produces a professional PDF with costs, sustainability metrics, charts, and digital twin summary. All reports are stored in your history for later download.",
  },
  {
    keywords: ["optimization", "optimize", "cloud optimization", "finops"],
    answer:
      "Cloud Optimization combines cost prediction, idle resource cleanup, right-sizing, green region migration, and digital twin simulation. CloudPulse AI surfaces the highest-impact actions to reduce spend and carbon together.",
  },
  {
    keywords: ["reduce cost", "save money", "lower cost"],
    answer:
      "To reduce cloud costs: eliminate idle VMs, reclaim unused storage, right-size databases, use reserved capacity, enable auto-scaling, and migrate to cost-efficient green regions. CloudPulse quantifies savings for each action.",
  },
  {
    keywords: ["cloudpulse", "what is cloudpulse", "platform", "features"],
    answer:
      "CloudPulse AI is an enterprise multi-cloud intelligence platform. Key features: AI Cost Prediction, Idle Resource Detection, Carbon Intelligence, Green Region Migration, Infrastructure Digital Twin, PDF Report Generation, and this AI Assistant for FinOps guidance.",
  },
  {
    keywords: ["improve sustainability", "go green", "environment"],
    answer:
      "Improve sustainability by migrating to greener regions, right-sizing workloads, scheduling non-production environments, adopting serverless where possible, and tracking your Sustainability Score and carbon trend monthly.",
  },
  {
    keywords: ["hello", "hi", "hey", "help", "assistant"],
    answer:
      "Hello! I'm the CloudPulse AI Assistant — your Enterprise Cloud Intelligence Assistant. Ask about cost prediction, idle resources, carbon footprint, sustainability score, green migration, digital twin, report generation, or cloud optimization.",
  },
];

export const getChatbotResponse = (message) => {
  const lower = message.toLowerCase().trim();
  if (!lower) {
    return "Please type a question and I'll explain CloudPulse AI platform features.";
  }

  for (const item of knowledge) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.answer;
    }
  }

  return "I can help with AI Cost Prediction, Idle Resource Detection, Carbon Footprint, Sustainability Score, Green Region Migration, Digital Twin, Report Generation, and Cloud Optimization. What would you like to know?";
};
