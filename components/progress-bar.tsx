"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: number
  title: string
  description: string
}

const steps: Step[] = [
  {
    id: 1,
    title: "テーマ入力",
    description: "記事のテーマを入力",
  },
  {
    id: 2,
    title: "見出し選択",
    description: "見出し候補から選択",
  },
  {
    id: 3,
    title: "目次構成",
    description: "目次の構成を編集",
  },
  {
    id: 4,
    title: "本文生成",
    description: "本文を生成・編集",
  },
]

interface ProgressBarProps {
  currentStep: number
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative">
        {/* プログレスライン */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentStep - 1) * 33.33}%` }}
        />

        {/* ステップ表示 */}
        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-colors",
                  currentStep > step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step.id
                      ? "border-primary"
                      : "border-muted",
                )}
              >
                {currentStep > step.id ? <Check className="h-5 w-5" /> : <span>{step.id}</span>}
              </div>
              <div className="mt-2 text-sm font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground">{step.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

