import { Badge } from "@/components/ui/badge"
import { BarChart3, Sparkles, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium">
        <Sparkles className="size-3" />
        AI-Powered Analytics
      </Badge>
      <div className="flex flex-col gap-3">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          AI Dashboard Builder
        </h1>
        <p className="mx-auto max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Turn your spreadsheets into instant insights. Upload your data and let
          AI do the rest.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          <span>Instant analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <span>Auto-generated charts</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span>AI-powered insights</span>
        </div>
      </div>
    </section>
  )
}
