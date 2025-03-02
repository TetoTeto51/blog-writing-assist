"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Save, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PreviewDialog } from "./preview-dialog"

interface OutlineData {
  theme: string
  heading: string
  outline: {
    id: string
    content: string
    children: {
      id: string
      content: string
    }[]
  }[]
}

interface Section {
  id: string
  title: string
  level: number
  content: string
  isGenerating: boolean
}

// ダミーデータ
const initialSections: Section[] = [
  {
    id: "1",
    title: "はじめに",
    level: 1,
    content:
      "プログラミング言語の世界には様々な選択肢がありますが、初心者にとって最適な言語の一つがPythonです。本記事では、Pythonの基礎から実践的な使い方まで、ステップバイステップで解説していきます。",
    isGenerating: false,
  },
  {
    id: "2",
    title: "Pythonの特徴と利点",
    level: 1,
    content:
      "Pythonは読みやすく書きやすい文法、豊富なライブラリ、大きなコミュニティなど、多くの利点を持つプログラミング言語です。特に初心者にとって、学習の障壁が低いことが大きな特徴です。",
    isGenerating: false,
  },
  {
    id: "2-1",
    title: "読みやすい文法",
    level: 2,
    content:
      "Pythonの文法は人間の言語に近く、直感的に理解しやすいように設計されています。インデントによるブロック構造、シンプルな制御構文など、コードの可読性を重視した特徴があります。",
    isGenerating: false,
  },
  {
    id: "2-2",
    title: "豊富なライブラリ",
    level: 2,
    content:
      "Python Package Index (PyPI) には20万以上のパッケージが登録されており、データ分析、機械学習、Web開発など、様々な用途に対応するライブラリが提供されています。",
    isGenerating: false,
  },
  {
    id: "3",
    title: "開発環境のセットアップ",
    level: 1,
    content:
      "Pythonを始めるには、まず開発環境をセットアップする必要があります。公式サイトからPythonをダウンロードしてインストールし、好みのエディタやIDEを設定しましょう。",
    isGenerating: false,
  },
  {
    id: "3-1",
    title: "Pythonのインストール",
    level: 2,
    content:
      "Python.orgから最新版をダウンロードしてインストールします。Windows、Mac、Linuxなど、主要なOSすべてに対応しています。インストール時にはPATHへの追加を忘れずに行いましょう。",
    isGenerating: false,
  },
  {
    id: "3-2",
    title: "VSCodeの設定",
    level: 2,
    content:
      "Visual Studio Code (VSCode) は無料で高機能なコードエディタです。Python拡張機能をインストールすることで、コード補完やデバッグ機能など、快適な開発環境が整います。",
    isGenerating: false,
  },
]

interface Article {
  id: string
  title: string
  status: "draft" | "published"
  updatedAt: string
  sections: Section[]
}

// ローカルストレージのキー
const STORAGE_KEY = "blog-content-sections"
const ARTICLES_KEY = "blog-articles"
const AUTO_SAVE_DELAY = 3000 // 3秒

export function ContentEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [sections, setSections] = useState<Section[]>([])
  const [currentSectionId, setCurrentSectionId] = useState<string>(sections[0]?.id)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 記事IDの取得
  const articleId = searchParams.get("id") || `article-${Date.now()}`

  // アウトラインデータの読み込み
  useEffect(() => {
    const savedOutline = localStorage.getItem("current-outline")
    if (!savedOutline) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "アウトラインデータが見つかりません。",
      })
      router.push("/")
      return
    }

    const outlineData: OutlineData = JSON.parse(savedOutline)
    
    // アウトラインからセクションを生成
    const newSections: Section[] = []
    
    // メインセクションの追加
    newSections.push({
      id: "heading",
      title: outlineData.heading,
      level: 1,
      content: "",
      isGenerating: false,
    })

    // アウトラインの各項目をセクションに変換
    outlineData.outline.forEach((item, index) => {
      // 中項目の追加
      newSections.push({
        id: `main-${index}`,
        title: item.content,
        level: 1,
        content: "",
        isGenerating: false,
      })

      // 小項目の追加
      item.children.forEach((child, childIndex) => {
        newSections.push({
          id: `sub-${index}-${childIndex}`,
          title: child.content,
          level: 2,
          content: "",
          isGenerating: false,
        })
      })
    })

    setSections(newSections)
    setCurrentSectionId(newSections[0]?.id)
  }, [router, toast])

  const handleContentChange = useCallback((id: string, content: string) => {
    setSections((prev) => prev.map((section) => (section.id === id ? { ...section, content } : section)))
    // 内容が変更されたら未保存状態にする
    setHasUnsavedChanges(true)
  }, [])

  const handleRegenerate = useCallback(
    async (id: string) => {
      const section = sections.find((s) => s.id === id)
      if (!section) return

      setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isGenerating: true } : s)))

      try {
        const response = await fetch("/api/generate-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            theme: section.title,
            heading: section.title,
            outline: [{
              id: section.id,
              content: section.title,
              children: []
            }]
          }),
        })

        if (!response.ok) {
          throw new Error("本文の生成に失敗しました")
        }

        const data = await response.json()
        const generatedContent = data.choices[0].message.content

        setSections((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  isGenerating: false,
                  content: generatedContent,
                }
              : s,
          ),
        )
        setHasUnsavedChanges(true)

        toast({
          title: "生成完了",
          description: "文章の生成が完了しました。",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "文章の生成中にエラーが発生しました。",
        })
        setSections((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isGenerating: false } : s))
        )
      }
    },
    [sections, toast],
  )

  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) return

    setIsSaving(true)
    try {
      // 記事データの作成
      const article: Article = {
        id: articleId,
        title: sections[0]?.content.split("\n")[0] || "無題の記事",
        status: "published",
        updatedAt: new Date().toISOString(),
        sections,
      }

      // 既存の記事一覧を取得
      const savedArticles = localStorage.getItem(ARTICLES_KEY)
      const articles: Article[] = savedArticles ? JSON.parse(savedArticles) : []

      // 記事を更新または追加
      const articleIndex = articles.findIndex((a) => a.id === articleId)
      if (articleIndex !== -1) {
        articles[articleIndex] = article
      } else {
        articles.push(article)
      }

      // 記事一覧を保存
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles))

      // 一時保存データを削除
      localStorage.removeItem(STORAGE_KEY)

      setHasUnsavedChanges(false)

      toast({
        title: "保存完了",
        description: "記事を保存しました。記事一覧に移動します。",
      })

      // 記事一覧ページに遷移
      router.push("/drafts")
    } catch (error) {
      console.error("保存エラー:", error)
      toast({
        variant: "destructive",
        title: "保存エラー",
        description: "記事の保存中にエラーが発生しました。",
      })
    } finally {
      setIsSaving(false)
    }
  }, [articleId, hasUnsavedChanges, router, sections, toast])

  // デバッグ用のログ出力
  useEffect(() => {
    console.log("Current state:", {
      hasUnsavedChanges,
      sectionsCount: sections.length,
      isSaving,
    })
  }, [hasUnsavedChanges, sections, isSaving])

  const currentSection = sections.find((s) => s.id === currentSectionId)

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4">
      {/* 左サイドバー：セクション一覧 */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSectionId(section.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md hover:bg-secondary/80 transition-colors",
                  section.id === currentSectionId && "bg-secondary",
                  section.level === 2 && "ml-4 text-sm"
                )}
              >
                {section.title}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* メインコンテンツ：エディターとプレビュー */}
      <div className="grid grid-cols-2 gap-4">
        {/* エディター（左側） */}
        <div className="space-y-4">
          <Card className="h-[calc(100vh-2rem)]">
            <ScrollArea className="h-full">
              <div className="p-4">
                {currentSection && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{currentSection.title}</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerate(currentSection.id)}
                        disabled={currentSection.isGenerating}
                        className="gap-2"
                      >
                        <RefreshCw className={cn("h-4 w-4", currentSection.isGenerating && "animate-spin")} />
                        {currentSection.isGenerating ? "生成中..." : "生成"}
                      </Button>
                    </div>
                    <Textarea
                      value={currentSection.content}
                      onChange={(e) => handleContentChange(currentSection.id, e.target.value)}
                      placeholder="本文を入力..."
                      className="min-h-[calc(100vh-8rem)] resize-none"
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* プレビュー（右側） */}
        <div className="space-y-4">
          <Card className="h-[calc(100vh-2rem)]">
            <ScrollArea className="h-full">
              <div className="p-4 prose prose-sm max-w-none">
                {currentSection && (
                  <>
                    <h2 className={cn(
                      "font-semibold mb-4",
                      currentSection.level === 2 ? "text-lg" : "text-xl"
                    )}>
                      {currentSection.title}
                    </h2>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {currentSection.content}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}

