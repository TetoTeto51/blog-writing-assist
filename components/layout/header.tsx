"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const steps = [
  { name: "テーマ入力", path: "/" },
  { name: "見出し選択", path: "/headings" },
  { name: "目次構成", path: "/outline" },
  { name: "本文生成", path: "/content" },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const currentStepIndex = steps.findIndex((step) => step.path === pathname)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            <span>ブログ記事執筆支援</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {steps.map((step, index) => (
              <div key={step.path} className={cn("transition-colors", index === currentStepIndex && "text-foreground")}>
                {step.name}
              </div>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/drafts")}>
          下書き一覧
        </Button>
      </div>
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </header>
  )
}

