"use client"

import { useState } from "react"
import { ThemeInput } from "@/components/theme-input"
import { OutlineGenerator } from "@/components/outline-generator"
import { ContentGenerator } from "@/components/content-generator"
import { ProgressBar } from "@/components/progress-bar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import axios from "axios"

interface HeadingResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

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
  const [generatedHeadings, setGeneratedHeadings] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleThemeSubmit = (themeText: string) => {
    setTheme(themeText)
    setCurrentStep(2)
  }

  const generateHeadings = async (themeText: string) => {
    setIsGenerating(true)
    try {
      const response = await axios.post<HeadingResponse>("/api/generate-headings", {
        theme: themeText
      })

      const content = response.data.choices[0].message.content
      const headingList = content
        .split("\n")
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*\*\*|\*\*$/g, "").trim())

      setGeneratedHeadings(headingList)
    } catch (err) {
      console.error("Error generating headings:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleHeadingSelect = (heading: string) => {
    setSelectedHeading(heading)
    setCurrentStep(3)
  }

  const handleOutlineSubmit = (outlineData: OutlineItem[]) => {
    setOutline(outlineData)
    setCurrentStep(4)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleNext = () => {
    setCurrentStep(currentStep + 1)
  }

  const handleHeadingsGenerated = (headings: string[]) => {
    setGeneratedHeadings(headings)
    setCurrentStep(2)
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
          <ThemeInput 
            onSubmit={handleThemeSubmit} 
            onHeadingsGenerated={handleHeadingsGenerated}
          />
        )}
        {currentStep === 2 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>見出しの選択</CardTitle>
              <CardDescription>
                生成された見出し候補から、記事の見出しを選択してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-md">
                  <h3 className="font-semibold mb-2">入力されたテーマ：</h3>
                  <p>{theme}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">生成された見出し候補：</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateHeadings(theme)}
                      disabled={isGenerating}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                      {isGenerating ? "生成中..." : "見出し再生成"}
                    </Button>
                  </div>
                  {generatedHeadings.map((heading, index) => (
                    <button
                      key={index}
                      onClick={() => handleHeadingSelect(heading)}
                      className="w-full text-left p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      {heading}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                戻る
              </Button>
            </CardFooter>
          </Card>
        )}
        {currentStep === 3 && (
          <OutlineGenerator
            theme={theme}
            heading={selectedHeading}
            onBack={handleBack}
            onNext={handleOutlineSubmit}
          />
        )}
        {currentStep === 4 && (
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
