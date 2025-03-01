"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Plus } from "lucide-react"
import { OutlineItem } from "./outline-item"

interface Section {
  id: string
  title: string
  level: number
  parentId: string | null
}

// ダミーデータ
const initialSections: Section[] = [
  {
    id: "1",
    title: "はじめに",
    level: 1,
    parentId: null,
  },
  {
    id: "2",
    title: "Pythonの特徴と利点",
    level: 1,
    parentId: null,
  },
  {
    id: "2-1",
    title: "読みやすい文法",
    level: 2,
    parentId: "2",
  },
  {
    id: "2-2",
    title: "豊富なライブラリ",
    level: 2,
    parentId: "2",
  },
  {
    id: "3",
    title: "開発環境のセットアップ",
    level: 1,
    parentId: null,
  },
  {
    id: "3-1",
    title: "Pythonのインストール",
    level: 2,
    parentId: "3",
  },
  {
    id: "3-2",
    title: "VSCodeの設定",
    level: 2,
    parentId: "3",
  },
  {
    id: "4",
    title: "基本的な文法",
    level: 1,
    parentId: null,
  },
  {
    id: "4-1",
    title: "変数と型",
    level: 2,
    parentId: "4",
  },
  {
    id: "4-2",
    title: "制御構文",
    level: 2,
    parentId: "4",
  },
  {
    id: "5",
    title: "まとめ",
    level: 1,
    parentId: null,
  },
]

export function OutlineEditor() {
  const router = useRouter()
  const [sections, setSections] = useState(initialSections)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeSection = sections.find((s) => s.id === active.id)
    const overSection = sections.find((s) => s.id === over.id)

    if (!activeSection || !overSection) return

    // 同じレベルのアイテム間でのみ並び替えを許可
    if (activeSection.level !== overSection.level) return

    setSections((sections) => {
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)

      const newSections = arrayMove(sections, oldIndex, newIndex)

      // 子セクションも一緒に移動
      const childSections = sections.filter((s) => s.parentId === active.id)
      if (childSections.length > 0) {
        const activeIndex = sections.findIndex((s) => s.id === active.id)
        const targetIndex = sections.findIndex((s) => s.id === over.id)
        const direction = targetIndex > activeIndex ? 1 : -1

        childSections.forEach((child) => {
          const childIndex = newSections.findIndex((s) => s.id === child.id)
          const newChildIndex = newIndex + direction
          newSections.splice(childIndex, 1)
          newSections.splice(newChildIndex, 0, child)
        })
      }

      return newSections
    })
  }

  const handleDelete = (id: string) => {
    // 削除対象のセクションとその子セクションをすべて削除
    setSections(sections.filter((section) => section.id !== id && section.parentId !== id))
  }

  const handleEdit = (id: string, newTitle: string) => {
    setSections(sections.map((section) => (section.id === id ? { ...section, title: newTitle } : section)))
  }

  const handleLevelChange = (id: string, increment: boolean) => {
    const sectionIndex = sections.findIndex((s) => s.id === id)
    if (sectionIndex === -1) return

    const section = sections[sectionIndex]
    const newLevel = increment ? section.level + 1 : section.level - 1

    // レベルの制約チェック
    if (newLevel < 1 || newLevel > 3) return

    // 新しい親IDを決定
    let newParentId: string | null = null
    if (newLevel > 1) {
      // 直前のより上位レベルのセクションを探す
      for (let i = sectionIndex - 1; i >= 0; i--) {
        if (sections[i].level < newLevel) {
          newParentId = sections[i].id
          break
        }
      }
    }

    setSections(
      sections.map((s) => {
        if (s.id === id) {
          return { ...s, level: newLevel, parentId: newParentId }
        }
        // 子セクションの更新
        if (s.parentId === id) {
          const newChildLevel = Math.min(newLevel + 1, 3)
          return { ...s, level: newChildLevel }
        }
        return s
      }),
    )
  }

  const handleAddSection = () => {
    const newId = `new-${Date.now()}`
    setSections([
      ...sections,
      {
        id: newId,
        title: "新しいセクション",
        level: 1,
        parentId: null,
      },
    ])
  }

  // レベルごとにセクションをグループ化してレンダリング
  const renderSections = () => {
    return sections.map((section) => (
      <OutlineItem
        key={section.id}
        section={section}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onLevelChange={handleLevelChange}
        isDraggable={sections.some((s) => s.level === section.level && s.id !== section.id)}
      />
    ))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Card className="p-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">{renderSections()}</div>
            </SortableContext>
          </DndContext>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleAddSection} className="gap-2">
            <Plus className="h-4 w-4" />
            セクションを追加
          </Button>
          <Button onClick={() => router.push("/content")} className="gap-2">
            次へ進む
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">プレビュー</h2>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} style={{ paddingLeft: `${(section.level - 1) * 1.5}rem` }} className="text-sm">
                {section.title}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

