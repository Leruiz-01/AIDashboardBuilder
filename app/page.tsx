"use client"

import { useCallback, useState } from "react"
import { HeroSection } from "@/components/dashboard/hero-section"
import { FileUpload } from "@/components/dashboard/file-upload"
import { AnalysisLoading } from "@/components/dashboard/analysis-loading"
import { AnalysisResults } from "@/components/dashboard/analysis-results"
import { DashboardPreview } from "@/components/dashboard/dashboard-preview"
import type { AnalysisResult } from "@/components/dashboard/analysis-card"

type AppState = "idle" | "loading" | "results"

export default function Page() {
  const [appState, setAppState] = useState<AppState>("idle")
  const [dashboardItems, setDashboardItems] = useState<AnalysisResult[]>([])
  const [analysisInsights, setAnalysisInsights] = useState<AnalysisResult[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null)

  const handleUpload = useCallback(async (file: File) => {
    setAppState("loading")
    setErrorMsg(null)

    // Capture the file completely as base64 to allow stateless chart rendering
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setFileDataUrl(dataUrl)

      const formData = new FormData()
      formData.append("file", file)

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        // data should contain { insights: [...] } based on our backend
        if (data.insights && Array.isArray(data.insights)) {
          setAnalysisInsights(data.insights)
          setAppState("results")
        } else {
          throw new Error("Invalid response structure from analysis server")
        }
      } catch (error) {
        console.error("Error analyzing file:", error)
        setErrorMsg((error as Error).message)
        setAppState("idle")
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleAddToDashboard = useCallback(
    (id: string) => {
      const result = analysisInsights.find((r) => r.id === id)
      if (result && !dashboardItems.some((item) => item.id === id)) {
        setDashboardItems((prev) => [...prev, result])
      }
    },
    [dashboardItems, analysisInsights]
  )

  const handleReset = useCallback(() => {
    setAppState("idle")
    setAnalysisInsights([])
    setErrorMsg(null)
    setFileDataUrl(null)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <HeroSection />

        {appState === "idle" && (
          <div className="flex flex-col gap-4 items-center">
            <FileUpload onUpload={handleUpload} />
            {errorMsg && (
              <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                Error: {errorMsg}
              </div>
            )}
          </div>
        )}

        {appState === "loading" && (
          <AnalysisLoading onComplete={() => { }} />
        )}

        {appState === "results" && (
          <>
            <AnalysisResults
              results={analysisInsights}
              onAddToDashboard={handleAddToDashboard}
            />
            <DashboardPreview
              items={dashboardItems}
              onReset={handleReset}
              fileDataUrl={fileDataUrl}
            />
          </>
        )}
      </div>
    </main>
  )
}

