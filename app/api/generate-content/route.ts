import { NextResponse } from "next/server"
import axios from "axios"

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/beta/chat/completions"

interface OutlineItem {
  id: string
  content: string
  children: OutlineItem[]
  isExpanded?: boolean
}

const flattenOutline = (items: OutlineItem[]): string => {
  return items.map(item => {
    const children = item.children.length > 0
      ? '\n' + flattenOutline(item.children)
      : ''
    return `${item.content}${children}`
  }).join('\n')
}

export async function POST(request: Request) {
  try {
    const { theme, heading, outline } = await request.json()

    if (!theme || !heading || !outline) {
      return NextResponse.json(
        { error: "必要なパラメータが不足しています" },
        { status: 400 }
      )
    }

    const flatOutline = flattenOutline(outline)

    const response = await axios.post(
      API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "あなたはブログ記事の執筆の専門家です。与えられたテーマ、見出し、アウトラインに基づいて、読者を惹きつける魅力的な記事を作成してください。以下の点に注意して執筆してください：\n\n1. 見出しとアウトラインの構造に忠実に従う\n2. 各セクションを適切な長さで展開する\n3. 読者が理解しやすい明確な説明を心がける\n4. 具体例や実践的なアドバイスを含める\n5. 自然な文章の流れを維持する"
          },
          {
            role: "user",
            content: `テーマ：${theme}\n見出し：${heading}\n\nアウトライン：\n${flatOutline}\n\n上記のテーマ、見出し、アウトラインに基づいて、ブログ記事を作成してください。`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Error generating content:", error)
    return NextResponse.json(
      { error: "本文の生成中にエラーが発生しました" },
      { status: 500 }
    )
  }
} 