"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Download, LayoutDashboard } from "lucide-react"
import type { AnalysisResult } from "./analysis-card"

interface DashboardPreviewProps {
  items: AnalysisResult[]
  onReset: () => void
}

export function DashboardPreview({ items, onReset }: DashboardPreviewProps) {
  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="size-4 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Dashboard Preview
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} widget{items.length !== 1 ? "s" : ""} added
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm">
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <DashboardWidget key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function DashboardWidget({ item }: { item: AnalysisResult }) {
  return (
    <Card className="rounded-xl shadow-none border bg-background">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {item.chartType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <WidgetChart type={item.chartType} />
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-foreground tabular-nums">
            {item.metric}
          </span>
          <span
            className={`text-xs font-medium ${
              item.trend === "up"
                ? "text-emerald-600"
                : item.trend === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
            }`}
          >
            {item.trend === "up"
              ? "+12%"
              : item.trend === "down"
                ? "-5%"
                : "0%"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function WidgetChart({ type }: { type: string }) {
  const barHeights = [35, 55, 40, 75, 50, 65, 85, 60, 45, 70, 55, 80]

  if (type === "bar") {
    return (
      <div className="flex h-20 items-end gap-1">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-primary/20"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    )
  }

  if (type === "line") {
    return (
      <svg
        viewBox="0 0 240 80"
        className="h-20 w-full"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 65 Q30 45, 60 55 T120 35 T180 40 T240 15"
          className="stroke-primary/40"
          strokeWidth="2"
        />
        <path
          d="M0 65 Q30 45, 60 55 T120 35 T180 40 T240 15 V80 H0 Z"
          className="fill-primary/8"
        />
      </svg>
    )
  }

  if (type === "pie") {
    return (
      <svg viewBox="0 0 80 80" className="mx-auto h-20 w-20" aria-hidden="true">
        <circle cx="40" cy="40" r="35" className="fill-muted" />
        <circle
          cx="40"
          cy="40"
          r="17.5"
          fill="none"
          className="stroke-primary"
          strokeWidth="35"
          strokeDasharray="75 110"
          strokeOpacity="0.3"
          transform="rotate(-90 40 40)"
        />
        <circle
          cx="40"
          cy="40"
          r="17.5"
          fill="none"
          className="stroke-chart-2"
          strokeWidth="35"
          strokeDasharray="35 110"
          strokeOpacity="0.3"
          transform="rotate(155 40 40)"
        />
      </svg>
    )
  }

  return (
    <div className="flex h-20 items-end gap-1">
      {barHeights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-primary/15"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}
