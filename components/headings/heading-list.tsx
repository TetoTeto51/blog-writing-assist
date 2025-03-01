"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { ArrowRight, RefreshCw, Edit2, Check } from "lucide-react"

// 複数のダミー見出しセット
const headingSets = [
  [
    {
      id: "1-1",
      title: "初心者でも分かる！Pythonプログラミング入門 - 基礎から実践まで",
    },
    {
      id: "1-2",
      title: "Python入門：プログラミング初心者が3日で基礎を習得する方法",
    },
    {
      id: "1-3",
      title: "【保存版】Python基礎講座：環境構築からプログラミングの第一歩まで",
    },
    {
      id: "1-4",
      title: "プログラミング未経験者向け：Pythonで始めるコーディング入門ガイド",
    },
  ],
  [
    {
      id: "2-1",
      title: "Python入門者必見！つまずきやすいポイントと解決方法",
    },
    {
      id: "2-2",
      title: "実践で使えるPython入門：基本文法から簡単なアプリ開発まで",
    },
    {
      id: "2-3",
      title: "Python学習ロードマップ：プログラミング初心者からエンジニアへの道",
    },
    {
      id: "2-4",
      title: "今から始めるPython：プログラミング入門者のための学習ガイド",
    },
  ],
  [
    {
      id: "3-1",
      title: "Python入門2024：最新バージョンで学ぶプログラミングの基礎",
    },
    {
      id: "3-2",
      title: "0からスタート！Python基礎マスター講座 - 実例で学ぶ入門ガイド",
    },
    {
      id: "3-3",
      title: "Python入門者のための実践プログラミング：基礎から応用まで",
    },
    {
      id: "3-4",
      title: "分かりやすく解説！Python入門 - プログラミング初心者の第一歩",
    },
  ],
]

export function HeadingList() {
  const router = useRouter()
  const [selectedHeading, setSelectedHeading] = useState<string>("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [headings, setHeadings] = useState(headingSets[0])
  const [editValue, setEditValue] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)

  const handleEdit = (id: string, title: string) => {
    setEditingId(id)
    setEditValue(title)
  }

  const handleSaveEdit = (id: string) => {
    setHeadings(headings.map((h) => (h.id === id ? { ...h, title: editValue } : h)))
    setEditingId(null)
  }

  const handleRegenerate = () => {
    setIsRegenerating(true)
    setSelectedHeading("") // 選択をリセット

    // 次の見出しセットのインデックスを計算
    const nextIndex = (currentSetIndex + 1) % headingSets.length

    // 遅延を入れて見出しを更新
    setTimeout(() => {
      setHeadings(headingSets[nextIndex])
      setCurrentSetIndex(nextIndex)
      setIsRegenerating(false)
    }, 1000)
  }

  const handleNext = () => {
    if (selectedHeading) {
      // TODO: 選択した見出しを保存
      router.push("/outline")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className={`transition-opacity duration-200 ${isRegenerating ? "opacity-50" : "opacity-100"}`}>
          <RadioGroup value={selectedHeading} onValueChange={setSelectedHeading} className="space-y-4">
            {headings.map((heading) => (
              <div
                key={heading.id}
                className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem value={heading.id} id={heading.id} />
                <div className="flex-1">
                  {editingId === heading.id ? (
                    <div className="flex items-center gap-2">
                      <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1" />
                      <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(heading.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={heading.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {heading.title}
                      </label>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(heading.id, heading.title)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleRegenerate} disabled={isRegenerating} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
          見出しを再生成
        </Button>
        <Button onClick={handleNext} disabled={!selectedHeading} className="gap-2">
          次へ進む
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {selectedHeading && (
        <div className="p-4 rounded-lg bg-muted/50">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">選択中の見出し</h3>
          <p className="font-medium">{headings.find((h) => h.id === selectedHeading)?.title}</p>
        </div>
      )}
    </div>
  )
}

