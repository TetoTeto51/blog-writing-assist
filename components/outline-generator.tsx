"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, ChevronRight, Plus, Minus, ChevronUp, ChevronDown } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface OutlineItem {
  id: string
  content: string
  children: OutlineItem[]
  isExpanded?: boolean
}

interface OutlineGeneratorProps {
  theme: string
  heading: string
  onBack: () => void
  onNext: (outline: OutlineItem[]) => void
}

interface OutlineItemProps {
  item: OutlineItem
  onToggle: (itemId: string) => void
  onMoveUp: (itemId: string) => void
  onMoveDown: (itemId: string) => void
  isFirst: boolean
  isLast: boolean
  level: number
}

const OutlineItemComponent = ({ 
  item, 
  onToggle, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast,
  level 
}: OutlineItemProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors group relative">
        <button
          onClick={() => onToggle(item.id)}
          className="p-1 hover:bg-secondary/80 rounded"
        >
          {item.children.length > 0 ? (
            item.isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <span className="flex-1">{item.content}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFirst ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
            onClick={() => !isFirst && onMoveUp(item.id)}
            disabled={isFirst}
            title="上に移動"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isLast ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
            onClick={() => !isLast && onMoveDown(item.id)}
            disabled={isLast}
            title="下に移動"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {item.isExpanded && item.children.length > 0 && (
        <div className="ml-6 space-y-2 border-l-2 border-secondary pl-4">
          {item.children.map((child, index) => (
            <OutlineItemComponent
              key={child.id}
              item={child}
              onToggle={onToggle}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isFirst={index === 0}
              isLast={index === item.children.length - 1}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function OutlineGenerator({ theme, heading, onBack, onNext }: OutlineGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outline, setOutline] = useState<OutlineItem[]>([])

  const generateOutline = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-outline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          heading,
        }),
      })

      if (!response.ok) {
        throw new Error("アウトライン生成に失敗しました")
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      const lines = content.split("\n").filter(line => line.trim())

      // 階層構造を解析
      const parseOutline = (lines: string[]): OutlineItem[] => {
        const result: OutlineItem[] = []
        let currentItem: OutlineItem | null = null
        let currentLevel = 0

        lines.forEach((line, index) => {
          const indent = line.search(/\S/)
          const content = line.trim().replace(/^-\s*/, "")
          const level = Math.floor(indent / 2)

          const item: OutlineItem = {
            id: `item-${index}`,
            content,
            children: [],
            isExpanded: true
          }

          if (level === 0) {
            result.push(item)
            currentItem = item
            currentLevel = 0
          } else if (level === currentLevel + 1 && currentItem) {
            currentItem.children.push(item)
          } else if (level === currentLevel && result.length > 0) {
            const parentIndex = result.length - 1
            result[parentIndex].children.push(item)
          }
        })

        return result
      }

      const outlineItems = parseOutline(lines)
      setOutline(outlineItems)
    } catch (err) {
      setError("アウトラインの生成中にエラーが発生しました。もう一度お試しください。")
      console.error("Error generating outline:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpand = (itemId: string) => {
    setOutline(prevOutline => {
      const toggleItem = (items: OutlineItem[]): OutlineItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, isExpanded: !item.isExpanded }
          }
          if (item.children.length > 0) {
            return { ...item, children: toggleItem(item.children) }
          }
          return item
        })
      }
      return toggleItem(prevOutline)
    })
  }

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    setOutline(prevOutline => {
      const moveItemInArray = (items: OutlineItem[], id: string): OutlineItem[] => {
        const index = items.findIndex(item => item.id === id)
        if (index === -1) {
          return items.map(item => ({
            ...item,
            children: moveItemInArray(item.children, id)
          }))
        }

        const newItems = [...items]
        if (direction === 'up' && index > 0) {
          [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
        } else if (direction === 'down' && index < items.length - 1) {
          [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
        }
        return newItems
      }

      return moveItemInArray(prevOutline, itemId)
    })
  }

  const handleNext = () => {
    // アウトラインをローカルストレージに保存
    localStorage.setItem("current-outline", JSON.stringify({
      theme,
      heading,
      outline
    }))
    // 親コンポーネントのonNext関数を呼び出す
    onNext(outline)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>アウトラインの生成</CardTitle>
        <CardDescription>
          選択された見出しに基づいて、記事のアウトラインを生成します。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-secondary rounded-md">
            <h3 className="font-semibold mb-2">選択された見出し：</h3>
            <p>{heading}</p>
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button
            onClick={generateOutline}
            disabled={isLoading}
            className="w-full relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="text-white" />
                <span className="animate-pulse">生成中...</span>
              </div>
            ) : (
              "アウトラインを生成"
            )}
          </Button>
          {outline.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">生成されたアウトライン：</h3>
                <p className="text-sm text-muted-foreground">↑↓ボタンで順序を変更できます</p>
              </div>
              <div className="space-y-2">
                {outline.map((item, index) => (
                  <OutlineItemComponent
                    key={item.id}
                    item={item}
                    onToggle={toggleExpand}
                    onMoveUp={(id) => moveItem(id, 'up')}
                    onMoveDown={(id) => moveItem(id, 'down')}
                    isFirst={index === 0}
                    isLast={index === outline.length - 1}
                    level={0}
                  />
                ))}
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
          onClick={handleNext}
          disabled={outline.length === 0}
          className="flex items-center gap-2"
        >
          次へ進む
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
} 