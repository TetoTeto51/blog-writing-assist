import { ProgressBar } from "@/components/progress-bar"
import { HeadingList } from "@/components/headings/heading-list"

export default function HeadingsPage() {
  return (
    <div>
      <ProgressBar currentStep={2} />
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold">見出し選択</h1>
          <p className="text-muted-foreground">
            AIが生成した見出し候補から、記事に最適な見出しを選択してください。 見出しは編集することもできます。
          </p>
        </div>
        <HeadingList />
      </div>
    </div>
  )
}

