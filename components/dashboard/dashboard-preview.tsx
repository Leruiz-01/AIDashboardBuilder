"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RotateCcw, Download, LayoutDashboard, Maximize2 } from "lucide-react"
import type { AnalysisResult } from "./analysis-card"

interface DashboardPreviewProps {
  items: AnalysisResult[]
  onReset: () => void
  fileDataUrl?: string | null
}

export function DashboardPreview({ items, onReset, fileDataUrl }: DashboardPreviewProps) {
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
              <DashboardWidget key={item.id} item={item} fileDataUrl={fileDataUrl} />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function DashboardWidget({ item, fileDataUrl }: { item: AnalysisResult, fileDataUrl?: string | null }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="rounded-xl shadow-none border bg-background hover:border-primary/50 cursor-pointer transition-colors group relative">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="size-4 text-muted-foreground" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium pr-6">{item.title}</CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {item.chartType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="pointer-events-none">
              <WidgetChart type={item.chartType} item={item} fileDataUrl={fileDataUrl} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg font-bold text-foreground tabular-nums">
                {item.metric}
              </span>
              <span
                className={`text-xs font-medium ${item.trend === "up"
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
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription className="text-base text-foreground mt-2">
            {item.insight}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <WidgetChart type={item.chartType} item={item} fileDataUrl={fileDataUrl} expanded />
        </div>
      </DialogContent>
    </Dialog>
  )
}

import React, { useEffect, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, Cell, XAxis, Tooltip } from "recharts"

function WidgetChart({ type, item, fileDataUrl, expanded = false }: { type: string, item: AnalysisResult, fileDataUrl?: string | null, expanded?: boolean }) {
  const [data, setData] = useState<{ name: string, value: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    async function fetchChartData() {
      try {
        setLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/chart-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            xAxis: item.parameters?.xAxis,
            yAxis: item.parameters?.yAxis,
            chartType: type,
            fileDataUrl: fileDataUrl
          })
        })

        if (!response.ok) {
          throw new Error("Failed to fetch chart data")
        }

        const result = await response.json()
        if (isMounted) {
          setData(result.data || [])
          setError(null)
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Only fetch if parameters exist
    if (item.parameters && item.parameters.xAxis && item.parameters.yAxis) {
      fetchChartData()
    } else {
      setLoading(false)
      setError("No chart parameters were generated by the AI for this insight.")
    }

    return () => { isMounted = false }
  }, [item])

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57']
  const heightClass = expanded ? "h-80" : "h-40"

  if (loading) {
    return <div className={`flex ${heightClass} items-center justify-center text-sm text-muted-foreground animate-pulse`}>Loading data...</div>
  }

  if (error) {
    return <div className={`flex ${heightClass} items-center justify-center text-xs text-red-500 text-center px-4`}>{error}</div>
  }

  if (data.length === 0) {
    return <div className={`flex ${heightClass} items-center justify-center text-sm text-muted-foreground`}>No data available</div>
  }

  return (
    <div className={`${heightClass} w-full mt-2`}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        ) : type === "line" ? (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        ) : type === "pie" ? (
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} fill="#8884d8" stroke="none">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="value" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth={2} opacity={0.4} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
