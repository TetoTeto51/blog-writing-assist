"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GripVertical, ChevronRight, ChevronLeft, Trash2, Edit2, Check, X } from "lucide-react"

interface Section {
  id: string
  title: string
  level: number
  parentId: string | null
}

interface OutlineItemProps {
  section: Section
  onDelete: (id: string) => void
  onEdit: (id: string, newTitle: string) => void
  onLevelChange: (id: string, increment: boolean) => void
  isDraggable: boolean
}

export function OutlineItem({ section, onDelete, onEdit, onLevelChange, isDraggable }: OutlineItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(section.title)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${(section.level - 1) * 1.5}rem`,
  }

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(section.id, editValue)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditValue(section.title)
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border bg-card p-2 ${isDragging ? "opacity-50" : ""}`}
    >
      <Button
        {...attributes}
        {...listeners}
        variant="ghost"
        size="icon"
        className={`${isDraggable ? "cursor-grab" : "cursor-not-allowed opacity-50"}`}
        disabled={!isDraggable}
      >
        <GripVertical className="h-4 w-4" />
      </Button>

      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1" />
            <Button size="icon" variant="ghost" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span className="text-sm">{section.title}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onLevelChange(section.id, false)}
          disabled={section.level === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onLevelChange(section.id, true)}
          disabled={section.level === 3}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(section.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

