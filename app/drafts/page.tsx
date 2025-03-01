import { DraftList } from "@/components/drafts/draft-list"

export default function DraftsPage() {
  return (
    <div>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold">記事一覧</h1>
          <p className="text-muted-foreground">作成した記事の一覧です。下書きと公開済みの記事を確認できます。</p>
        </div>
        <DraftList />
      </div>
    </div>
  )
}

