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
  const [activeSection, setActiveSection] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 記事IDの取得
  const articleId = searchParams.get("id") || `article-${Date.now()}`

  // 初期データの読み込み
  useEffect(() => {
    const loadArticle = () => {
      // 既存の記事を確認
      const savedArticles = localStorage.getItem(ARTICLES_KEY)
      if (savedArticles) {
        const articles: Article[] = JSON.parse(savedArticles)
        const article = articles.find((a) => a.id === articleId)
        if (article) {
          setSections(article.sections)
          setActiveSection(article.sections[0]?.id || "")
          return
        }
      }

      // 一時保存データを確認
      const savedSections = localStorage.getItem(STORAGE_KEY)
      if (savedSections) {
        const parsed = JSON.parse(savedSections)
        setSections(parsed)
        setActiveSection(parsed[0]?.id || "")
        return
      }

      // 新規作成の場合はダミーデータを使用
      setSections(initialSections)
      setActiveSection(initialSections[0]?.id || "")
      // 新規作成時は編集可能な状態にする
      setHasUnsavedChanges(true)
    }

    loadArticle()
  }, [articleId])

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
        // ダミーの生成処理
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setSections((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  isGenerating: false,
                  content: `これは${s.title}のための新しく生成された本文です。

例えば、このセクションでは以下のような内容を説明します：

1. ${s.title}の基本概念
2. 具体的な使用例とベストプラクティス
3. よくある問題とその解決方法
4. 応用的な使い方とヒント

これらの内容を通じて、読者が${s.title}について深く理解できるように解説していきます。`,
                }
              : s,
          ),
        )
        // 再生成後は未保存状態にする
        setHasUnsavedChanges(true)

        toast({
          title: "再生成完了",
          description: "文章の再生成が完了しました。",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "文章の生成中にエラーが発生しました。",
        })
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

  const currentSection = sections.find((s) => s.id === activeSection)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-4">
      {/* 左サイドバー：目次ナビゲーション */}
      <div className="lg:h-[calc(100vh-16rem)]">
        <Card className="h-full">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors",
                    "hover:bg-muted",
                    section.id === activeSection && "bg-muted",
                    section.isGenerating && "text-muted-foreground",
                  )}
                  style={{ paddingLeft: `${section.level * 0.75}rem` }}
                >
                  {section.title}
                  {hasUnsavedChanges && section.id === activeSection && (
                    <span className="ml-2 text-xs text-muted-foreground">●</span>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* 中央：エディター */}
      <div className="lg:h-[calc(100vh-16rem)]">
        <Card className="h-full">
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
                      再生成
                    </Button>
                  </div>
                  <Textarea
                    value={currentSection.content}
                    onChange={(e) => handleContentChange(currentSection.id, e.target.value)}
                    placeholder="本文を入力..."
                    className="min-h-[500px] resize-none"
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* 右サイドバー：コントロール */}
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">文字数</h3>
          <p className="text-2xl font-bold">
            {currentSection ? currentSection.content.length : 0}
            <span className="text-sm text-muted-foreground ml-1">文字</span>
          </p>
        </div>

        <div className="space-y-2">
          <Button className="w-full gap-2" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
            <Save className={cn("h-4 w-4", isSaving && "animate-spin")} />
            {isSaving ? "保存中..." : "記事を完了"}
            {hasUnsavedChanges && <span className="ml-2 text-xs">●</span>}
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={() => setIsPreviewOpen(true)}>
            プレビュー
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <PreviewDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen} sections={sections} />
    </div>
  )
}

