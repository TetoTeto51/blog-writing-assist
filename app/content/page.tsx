import { ProgressBar } from "@/components/progress-bar"
import { ContentEditor } from "@/components/content/content-editor"

export default function ContentPage() {
  return (
    <div>
      <ProgressBar currentStep={4} />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold">本文生成・編集</h1>
          <p className="text-muted-foreground">
            各セクションの本文を生成・編集できます。AIが文章を生成し、 必要に応じて編集することができます。
          </p>
        </div>
        <ContentEditor />
      </div>
    </div>
  )
}

