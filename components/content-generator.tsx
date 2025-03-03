"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, ChevronRight } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useRouter } from "next/navigation"

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
}

export function ContentGenerator({ theme, heading, outline, onBack }: ContentGeneratorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 記事データの作成
      const article = {
        id: `article-${Date.now()}`,
        title: heading,
        content: content,
        theme: theme,
        outline: outline,
        createdAt: new Date().toISOString(),
        status: "draft"
      }

      // 既存の記事一覧を取得
      const savedArticles = localStorage.getItem("saved-articles")
      const articles = savedArticles ? JSON.parse(savedArticles) : []

      // 新しい記事を追加
      articles.push(article)

      // 記事一覧を保存
      localStorage.setItem("saved-articles", JSON.stringify(articles))

      // 記事一覧ページに遷移
      router.push("/articles")
    } catch (error) {
      setError("記事の保存中にエラーが発生しました")
      console.error("Error saving article:", error)
    } finally {
      setIsSaving(false)
    }
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
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <h1 className="text-2xl font-bold mb-4">{heading}</h1>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {content}
                        </ReactMarkdown>
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
          onClick={handleSave}
          disabled={!content || isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "保存中..." : "保存する"}
        </Button>
      </CardFooter>
    </Card>
  )
} 