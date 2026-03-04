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

import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, Cell, Tooltip } from "recharts"

export interface AnalysisResult {
  id: string
  title: string
  insight: string
  chartType: "bar" | "line" | "pie" | "area"
  metric: string
  trend: "up" | "down" | "neutral"
  parameters: {
    xAxis: string
    yAxis: string
  }
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
            className={`text-xs font-medium ${result.trend === "up"
                ? "text-emerald-600"
                : result.trend === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
          >
            {result.trend === "up" ? "Upward" : result.trend === "down" ? "Downward" : "Stable"}
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
  // Using some mock data to make the 'mini chart' alive inside the suggestion card
  const mockData = [
    { name: "A", value: 40 },
    { name: "B", value: 65 },
    { name: "C", value: 45 },
    { name: "D", value: 80 },
    { name: "E", value: 55 },
    { name: "F", value: 70 },
  ]

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57']

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart data={mockData}>
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} opacity={0.6} />
          </BarChart>
        ) : type === "line" ? (
          <LineChart data={mockData}>
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} opacity={0.6} />
          </LineChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie data={mockData} dataKey="value" cx="50%" cy="50%" innerRadius={20} outerRadius={40} fill="#8884d8" stroke="none">
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.6} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <AreaChart data={mockData}>
            <Area type="monotone" dataKey="value" fill="hsl(var(--primary))" stroke="none" opacity={0.3} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
