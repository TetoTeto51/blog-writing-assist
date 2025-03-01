"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Article {
  id: string
  title: string
  status: "draft" | "published"
  updatedAt: string
  sections: Array<{
    id: string
    title: string
    content: string
  }>
}

export function DraftList() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    // ローカルストレージから記事一覧を取得
    const loadArticles = () => {
      const savedArticles = localStorage.getItem("blog-articles")
      if (savedArticles) {
        setArticles(JSON.parse(savedArticles))
      }
    }

    loadArticles()
    // ストレージの変更を監視
    window.addEventListener("storage", loadArticles)
    return () => window.removeEventListener("storage", loadArticles)
  }, [])

  const handleEdit = (id: string) => {
    router.push(`/content?id=${id}`)
  }

  const handleDelete = (id: string) => {
    if (confirm("この記事を削除してもよろしいですか？")) {
      const newArticles = articles.filter((article) => article.id !== id)
      localStorage.setItem("blog-articles", JSON.stringify(newArticles))
      setArticles(newArticles)
    }
  }

  if (articles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">記事がありません</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          新しい記事を作成
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Card key={article.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{article.title}</h2>
                <Badge variant={article.status === "published" ? "default" : "secondary"}>
                  {article.status === "published" ? "公開済み" : "下書き"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">最終更新: {formatDate(article.updatedAt)}</p>
              <p className="text-sm text-muted-foreground">セクション数: {article.sections.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(article.id)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

