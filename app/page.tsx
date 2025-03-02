"use client"

import { useState } from "react"
import { ThemeInput } from "@/components/theme-input"
import { OutlineGenerator } from "@/components/outline-generator"
import { ContentGenerator } from "@/components/content-generator"
import { ProgressBar } from "@/components/progress-bar"

interface OutlineItem {
  id: string
  content: string
  children: OutlineItem[]
  isExpanded?: boolean
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [theme, setTheme] = useState("")
  const [selectedHeading, setSelectedHeading] = useState("")
  const [outline, setOutline] = useState<OutlineItem[]>([])

  const handleThemeSubmit = (themeText: string, heading: string) => {
    setTheme(themeText)
    setSelectedHeading(heading)
    setCurrentStep(2)
  }

  const handleOutlineSubmit = (outlineData: OutlineItem[]) => {
    setOutline(outlineData)
    setCurrentStep(3)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleNext = () => {
    setCurrentStep(currentStep + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <ProgressBar currentStep={currentStep} />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold">ブログ記事作成支援</h1>
          <p className="text-muted-foreground">
            記事のテーマを入力して、AIがブログ記事の作成をサポートします。
          </p>
        </div>
        {currentStep === 1 && (
          <ThemeInput onSubmit={handleThemeSubmit} />
        )}
        {currentStep === 2 && (
          <OutlineGenerator
            theme={theme}
            heading={selectedHeading}
            onBack={handleBack}
            onNext={handleOutlineSubmit}
          />
        )}
        {currentStep === 3 && (
          <ContentGenerator
            theme={theme}
            heading={selectedHeading}
            outline={outline}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  )
}
