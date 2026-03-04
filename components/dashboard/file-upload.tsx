"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileSpreadsheet, X } from "lucide-react"

interface FileUploadProps {
  onUpload: (file: File) => void
  disabled?: boolean
}

export function FileUpload({ onUpload, disabled }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file && isValidFile(file)) {
      setSelectedFile(file)
    }
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && isValidFile(file)) {
        setSelectedFile(file)
      }
    },
    []
  )

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }, [selectedFile, onUpload])

  const clearFile = useCallback(() => {
    setSelectedFile(null)
  }, [])

  return (
    <Card className="border-dashed border-2 shadow-none bg-card">
      <CardContent className="flex flex-col items-center gap-6 py-12">
        <div
          role="region"
          aria-label="File upload area"
          className={`flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-8 transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Upload className="size-6 text-primary" />
          </div>

          {selectedFile ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <FileSpreadsheet className="size-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {selectedFile.name}
                </span>
                <button
                  onClick={clearFile}
                  className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Remove file"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="text-sm font-medium text-foreground">
                Drop your file here, or{" "}
                <label className="cursor-pointer text-primary underline underline-offset-4 hover:text-primary/80">
                  browse
                  <input
                    type="file"
                    className="sr-only"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </label>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports CSV and XLSX files
              </p>
            </div>
          )}
        </div>

        <Button
          size="lg"
          className="min-w-[200px]"
          onClick={handleUpload}
          disabled={!selectedFile || disabled}
        >
          <FileSpreadsheet className="size-4" />
          Upload and Analyze
        </Button>
      </CardContent>
    </Card>
  )
}

function isValidFile(file: File): boolean {
  const validTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ]
  return (
    validTypes.includes(file.type) ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls")
  )
}
