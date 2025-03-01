import { ProgressBar } from "@/components/progress-bar"
import { OutlineEditor } from "@/components/outline/outline-editor"

export default function OutlinePage() {
  return (
    <div>
      <ProgressBar currentStep={3} />
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold">目次構成</h1>
          <p className="text-muted-foreground">
            記事の目次構成を編集できます。ドラッグ&ドロップで項目を並び替えたり、 編集・削除ができます。
          </p>
        </div>
        <OutlineEditor />
      </div>
    </div>
  )
}

