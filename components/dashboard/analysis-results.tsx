"use client"

import { AnalysisCard, type AnalysisResult } from "./analysis-card"

interface AnalysisResultsProps {
  results: AnalysisResult[]
  onAddToDashboard: (id: string) => void
}

export function AnalysisResults({
  results,
  onAddToDashboard,
}: AnalysisResultsProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Analysis Results
        </h2>
        <p className="text-sm text-muted-foreground">
          AI discovered {results.length} insights from your data. Add them to
          your dashboard.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <AnalysisCard
            key={result.id}
            result={result}
            onAddToDashboard={onAddToDashboard}
          />
        ))}
      </div>
    </section>
  )
}
