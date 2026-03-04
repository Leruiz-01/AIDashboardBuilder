"use client"

import { useCallback, useState } from "react"
import { HeroSection } from "@/components/dashboard/hero-section"
import { FileUpload } from "@/components/dashboard/file-upload"
import { AnalysisLoading } from "@/components/dashboard/analysis-loading"
import { AnalysisResults } from "@/components/dashboard/analysis-results"
import { DashboardPreview } from "@/components/dashboard/dashboard-preview"
import type { AnalysisResult } from "@/components/dashboard/analysis-card"
import { SAMPLE_RESULTS } from "@/lib/sample-data"

type AppState = "idle" | "loading" | "results"

export default function Page() {
  const [appState, setAppState] = useState<AppState>("idle")
  const [dashboardItems, setDashboardItems] = useState<AnalysisResult[]>([])

  const handleUpload = useCallback(() => {
    setAppState("loading")
  }, [])

  const handleAnalysisComplete = useCallback(() => {
    setAppState("results")
  }, [])

  const handleAddToDashboard = useCallback(
    (id: string) => {
      const result = SAMPLE_RESULTS.find((r) => r.id === id)
      if (result && !dashboardItems.some((item) => item.id === id)) {
        setDashboardItems((prev) => [...prev, result])
      }
    },
    [dashboardItems]
  )

  const handleReset = useCallback(() => {
    setAppState("idle")
    setDashboardItems([])
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <HeroSection />

        {appState === "idle" && (
          <FileUpload onUpload={handleUpload} />
        )}

        {appState === "loading" && (
          <AnalysisLoading onComplete={handleAnalysisComplete} />
        )}

        {appState === "results" && (
          <>
            <AnalysisResults
              results={SAMPLE_RESULTS}
              onAddToDashboard={handleAddToDashboard}
            />
            <DashboardPreview
              items={dashboardItems}
              onReset={handleReset}
            />
          </>
        )}
      </div>
    </main>
  )
}
