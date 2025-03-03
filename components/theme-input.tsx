"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  onSubmit: (theme: string) => void
  onHeadingsGenerated: (headings: string[]) => void
}

export function ThemeInput({ onSubmit, onHeadingsGenerated }: ThemeInputProps) {
  const [theme, setTheme] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      onSubmit(theme)
      onHeadingsGenerated(headingList)
    } catch (err) {
      setError("見出しの生成中にエラーが発生しました。もう一度お試しください。")
      console.error("Error generating headings:", err)
    } finally {
      setIsLoading(false)
    }
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
        </div>
      </CardContent>
    </Card>
  )
}

