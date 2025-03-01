"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X, Printer } from "lucide-react"

interface Section {
  id: string
  title: string
  level: number
  content: string
  isGenerating: boolean
}

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: Section[]
}

export function PreviewDialog({ open, onOpenChange, sections }: PreviewDialogProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">プレビュー</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-full pr-4">
          <article className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
            {sections.map((section) => (
              <div key={section.id} style={{ marginLeft: `${(section.level - 1) * 2}rem` }}>
                <h3 className="mt-6 mb-4">{section.title}</h3>
                <p className="whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
          </article>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

