"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Check } from "lucide-react"
import { useState } from "react"

export interface AnalysisResult {
  id: string
  title: string
  insight: string
  chartType: "bar" | "line" | "pie" | "area"
  metric: string
  trend: "up" | "down" | "neutral"
}

interface AnalysisCardProps {
  result: AnalysisResult
  onAddToDashboard: (id: string) => void
}

export function AnalysisCard({ result, onAddToDashboard }: AnalysisCardProps) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    setAdded(true)
    onAddToDashboard(result.id)
  }

  return (
    <Card className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow rounded-2xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{result.title}</CardTitle>
          <Badge variant="secondary" className="text-xs shrink-0">
            {result.chartType}
          </Badge>
        </div>
        <CardDescription className="leading-relaxed">
          {result.insight}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <MiniChart type={result.chartType} />
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">
            {result.metric}
          </span>
          <span
            className={`text-xs font-medium ${
              result.trend === "up"
                ? "text-emerald-600"
                : result.trend === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
            }`}
          >
            {result.trend === "up" ? "+12%" : result.trend === "down" ? "-5%" : "0%"}
          </span>
        </div>
        <Button
          variant={added ? "secondary" : "default"}
          size="sm"
          onClick={handleAdd}
          disabled={added}
        >
          {added ? (
            <>
              <Check className="size-3.5" />
              Added
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              Add to Dashboard
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function MiniChart({ type }: { type: string }) {
  return (
    <div className="flex h-24 items-end gap-1.5">
      {type === "bar" &&
        [40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-primary/20 transition-all hover:bg-primary/40"
            style={{ height: `${h}%` }}
          />
        ))}
      {type === "line" && (
        <svg
          viewBox="0 0 200 80"
          className="h-full w-full"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 60 Q25 40, 50 50 T100 30 T150 45 T200 20"
            className="stroke-primary/40"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0 60 Q25 40, 50 50 T100 30 T150 45 T200 20 V80 H0 Z"
            className="fill-primary/10"
          />
        </svg>
      )}
      {type === "pie" && (
        <svg viewBox="0 0 80 80" className="mx-auto size-20" aria-hidden="true">
          <circle cx="40" cy="40" r="35" className="fill-primary/10" />
          <circle
            cx="40"
            cy="40"
            r="17.5"
            fill="none"
            className="stroke-primary/40"
            strokeWidth="35"
            strokeDasharray="70 110"
            transform="rotate(-90 40 40)"
          />
        </svg>
      )}
      {type === "area" &&
        [30, 50, 35, 70, 60, 80, 55, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-primary/15 transition-all hover:bg-primary/30"
            style={{ height: `${h}%` }}
          />
        ))}
    </div>
  )
}
