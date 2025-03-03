"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenSquare, Trash2 } from "lucide-react"

interface Article {
  id: string
  title: string
  theme: string
  content: string
  outline: any[]
  createdAt: string
  status: "draft"
}

export default function ArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    const savedArticles = localStorage.getItem("saved-articles")
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles))
    }
  }, [])

  const handleDelete = (id: string) => {
    const updatedArticles = articles.filter(article => article.id !== id)
    setArticles(updatedArticles)
    localStorage.setItem("saved-articles", JSON.stringify(updatedArticles))
  }

  const handleEdit = (id: string) => {
    router.push(`/content?id=${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-2xl font-bold">保存した記事一覧</h1>
        <p className="text-muted-foreground">
          これまでに保存した記事の一覧です。編集や削除ができます。
        </p>
      </div>

      <div className="grid gap-4">
        {articles.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                保存された記事はありません。
              </p>
            </CardContent>
          </Card>
        ) : (
          articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>
                      テーマ: {article.theme}
                      <br />
                      作成日: {new Date(article.createdAt).toLocaleDateString("ja-JP")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(article.id)}
                      title="編集"
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(article.id)}
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
        >
          新しい記事を作成
        </Button>
      </div>
    </div>
  )
} 