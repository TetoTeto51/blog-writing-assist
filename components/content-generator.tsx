"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

interface OutlineItem {
  id: string
  content: string
  children: OutlineItem[]
  isExpanded?: boolean
}

interface ContentGeneratorProps {
  theme: string
  heading: string
  outline: OutlineItem[]
  onBack: () => void
  onNext: () => void
}

export function ContentGenerator({ theme, heading, outline, onBack, onNext }: ContentGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<string>("")

  const generateContent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          heading,
          outline,
        }),
      })

      if (!response.ok) {
        throw new Error("本文の生成に失敗しました")
      }

      const data = await response.json()
      const generatedContent = data.choices[0].message.content
      setContent(generatedContent)
    } catch (err) {
      setError("本文の生成中にエラーが発生しました。もう一度お試しください。")
      console.error("Error generating content:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>本文の生成と編集</CardTitle>
        <CardDescription>
          アウトラインに基づいて本文を生成し、必要に応じて編集できます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-secondary rounded-md">
            <h3 className="font-semibold mb-2">選択された見出し：</h3>
            <p>{heading}</p>
          </div>
          <div className="p-4 bg-secondary rounded-md">
            <h3 className="font-semibold mb-2">アウトライン：</h3>
            <div className="space-y-2">
              {outline.map((item, index) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    {item.content}
                  </div>
                  {item.children.length > 0 && (
                    <div className="ml-4 pl-2 border-l-2 border-secondary space-y-1">
                      {item.children.map((child) => (
                        <div key={child.id} className="text-sm text-muted-foreground">
                          • {child.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button
            onClick={generateContent}
            disabled={isLoading}
            className="w-full relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="text-white" />
                <span className="animate-pulse">生成中...</span>
              </div>
            ) : (
              "本文を生成"
            )}
          </Button>
          {content && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">本文の編集とプレビュー：</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* エディター（左側） */}
                <div className="space-y-2">
                  <Card>
                    <ScrollArea className="h-[600px] w-full rounded-md border">
                      <Textarea
                        value={content}
                        onChange={handleContentChange}
                        className="min-h-[600px] resize-none border-0 focus-visible:ring-0"
                        placeholder="本文を編集..."
                      />
                    </ScrollArea>
                  </Card>
                </div>
                {/* プレビュー（右側） */}
                <div className="space-y-2">
                  <Card>
                    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                      <div className="prose prose-sm max-w-none">
                        <h1 className="text-2xl font-bold mb-4">{heading}</h1>
                        <div className="whitespace-pre-wrap">{content}</div>
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          戻る
        </Button>
        <Button
          onClick={onNext}
          disabled={!content}
          className="flex items-center gap-2"
        >
          次へ進む
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
} 