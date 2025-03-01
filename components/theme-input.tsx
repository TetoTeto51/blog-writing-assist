"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"

export function ThemeInput() {
  const [theme, setTheme] = useState("")
  const router = useRouter()
  const maxLength = 100

  const handleNext = () => {
    if (theme.trim()) {
      // TODO: テーマを保存する処理を追加
      router.push("/headings") // 見出し選択ページへ遷移
    }
  }

  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Textarea
              placeholder="記事のテーマを入力してください"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              maxLength={maxLength}
              rows={5}
              className="resize-none"
            />
            <div className="text-sm text-muted-foreground text-right">
              {theme.length}/{maxLength}文字
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleNext} disabled={!theme.trim()} className="gap-2">
            次へ進む
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

