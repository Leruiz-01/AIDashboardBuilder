"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles } from "lucide-react"

const ANALYSIS_STEPS = [
  "Reading file structure...",
  "Detecting column types...",
  "Running statistical analysis...",
  "Identifying trends and patterns...",
  "Generating chart recommendations...",
  "Building AI insights...",
]

interface AnalysisLoadingProps {
  onComplete: () => void
}

export function AnalysisLoading({ onComplete }: AnalysisLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 400)
          return 100
        }
        return next
      })
    }, 80)

    return () => clearInterval(interval)
  }, [onComplete])

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) =>
        prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev
      )
    }, 700)

    return () => clearInterval(stepInterval)
  }, [])

  return (
    <Card className="mx-auto max-w-lg shadow-none">
      <CardContent className="flex flex-col items-center gap-6 py-12">
        <div className="relative flex size-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="size-6 text-primary animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            AI is analyzing your data
          </h3>
          <p className="h-5 text-sm text-muted-foreground transition-all">
            {ANALYSIS_STEPS[stepIndex]}
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2">
          <Progress value={progress} className="h-1.5" />
          <p className="text-center text-xs text-muted-foreground tabular-nums">
            {progress}%
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
