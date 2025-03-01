"use client"

import { ThemeInput } from "@/components/theme-input"
import { ProgressBar } from "@/components/progress-bar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <ProgressBar currentStep={1} />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold">ブログ記事作成支援</h1>
          <p className="text-muted-foreground">
            記事のテーマを入力して、AIがブログ記事の作成をサポートします。
          </p>
        </div>
        <ThemeInput />
      </div>
    </div>
  )
}
