"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import axios from "axios"

interface HeadingResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

interface ThemeInputProps {
  onSubmit: (theme: string, heading: string) => void
}

export function ThemeInput({ onSubmit }: ThemeInputProps) {
  const [theme, setTheme] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [headings, setHeadings] = useState<string[]>([])
  const [selectedHeading, setSelectedHeading] = useState<string>("")

  const generateHeadings = async () => {
    if (!theme.trim()) {
      setError("テーマを入力してください")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post<HeadingResponse>("/api/generate-headings", {
        theme: theme
      })

      const content = response.data.choices[0].message.content
      const headingList = content
        .split("\n")
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*\*\*|\*\*$/g, "").trim())

      setHeadings(headingList)
      setSelectedHeading("")
    } catch (err) {
      setError("見出しの生成中にエラーが発生しました。もう一度お試しください。")
      console.error("Error generating headings:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (!selectedHeading) {
      setError("見出しを選択してください")
      return
    }
    onSubmit(theme, selectedHeading)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>記事のテーマを入力</CardTitle>
        <CardDescription>
          記事のテーマを入力してください。AIが見出しの候補を生成します。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="例：プログラミング初心者向けのTypeScript入門"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="min-h-[100px]"
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button 
            onClick={generateHeadings}
            disabled={isLoading}
            className="w-full relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="text-white" />
                <span className="animate-pulse">生成中...</span>
              </div>
            ) : (
              "見出しを生成"
            )}
          </Button>
          {headings.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">生成された見出し候補：</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateHeadings}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="animate-pulse">再生成中...</span>
                    </>
                  ) : (
                    "別の候補を生成"
                  )}
                </Button>
              </div>
              <RadioGroup
                value={selectedHeading}
                onValueChange={setSelectedHeading}
                className="space-y-2"
              >
                {headings.map((heading, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-2 p-3 rounded-md bg-secondary cursor-pointer hover:bg-secondary/80"
                  >
                    <RadioGroupItem value={heading} id={`heading-${index}`} />
                    <span className="flex-1">{heading}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
      </CardContent>
      {headings.length > 0 && (
        <CardFooter>
          <Button
            onClick={handleNext}
            disabled={!selectedHeading}
            className="w-full flex items-center justify-center gap-2"
          >
            次へ進む
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

