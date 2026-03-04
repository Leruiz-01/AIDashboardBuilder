import type { AnalysisResult } from "@/components/dashboard/analysis-card"

export const SAMPLE_RESULTS: AnalysisResult[] = [
  {
    id: "revenue-trend",
    title: "Revenue Trend",
    insight:
      "Monthly revenue shows a consistent 12% growth over the past quarter, driven primarily by enterprise subscriptions.",
    chartType: "line",
    metric: "$284K",
    trend: "up",
    parameters: { xAxis: "Month", yAxis: "Revenue" }
  },
  {
    id: "user-distribution",
    title: "User Distribution",
    insight:
      "Free tier users make up 64% of total accounts, while premium users contribute 82% of total revenue.",
    chartType: "pie",
    metric: "12.4K",
    trend: "up",
    parameters: { xAxis: "User Type", yAxis: "Count" }
  },
  {
    id: "conversion-rate",
    title: "Conversion Funnel",
    insight:
      "Landing page to signup conversion sits at 3.2%, with the biggest drop-off occurring at the pricing page step.",
    chartType: "bar",
    metric: "3.2%",
    trend: "down",
    parameters: { xAxis: "Funnel Step", yAxis: "Users" }
  },
  {
    id: "churn-analysis",
    title: "Churn Analysis",
    insight:
      "Churn rate decreased to 2.1% this month. Users who complete onboarding are 4x less likely to churn.",
    chartType: "area",
    metric: "2.1%",
    trend: "up",
    parameters: { xAxis: "Month", yAxis: "Churn Rate" }
  },
  {
    id: "feature-usage",
    title: "Feature Usage",
    insight:
      "Dashboard exports are the most-used feature at 89% adoption, while API access remains underutilized at 23%.",
    chartType: "bar",
    metric: "89%",
    trend: "neutral",
    parameters: { xAxis: "Feature", yAxis: "Adoption" }
  },
  {
    id: "growth-forecast",
    title: "Growth Forecast",
    insight:
      "Based on current trajectory, projected ARR will reach $4.2M by end of Q4, assuming steady acquisition rates.",
    chartType: "line",
    metric: "$4.2M",
    trend: "up",
    parameters: { xAxis: "Quarter", yAxis: "Projected ARR" }
  },
]
