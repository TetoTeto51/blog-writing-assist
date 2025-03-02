import { NextResponse } from "next/server"
import axios from "axios"

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/beta/chat/completions"

export async function POST(request: Request) {
  try {
    const { theme, heading } = await request.json()

    if (!theme || !heading) {
      return NextResponse.json(
        { error: "テーマまたは見出しが入力されていません" },
        { status: 400 }
      )
    }

    const response = await axios.post(
      API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "あなたはブログ記事のアウトライン作成の専門家です。与えられたテーマと見出しに基づいて、以下の構造でアウトラインを提案してください：\n\n1. 必ず4つの中項目を作成\n2. 各中項目に2-3個の小項目を含める\n3. 中項目は「- 」で始め、小項目は2スペースのインデントと「- 」で表現\n4. 論理的な流れを持ち、読者が理解しやすい構造にする"
          },
          {
            role: "user",
            content: `テーマ：${theme}\n見出し：${heading}\n\n上記のテーマと見出しに基づき、4つの中項目とそれぞれ2-3個の小項目を含むアウトラインを作成してください。\n\n例：\n- 中項目1\n  - 小項目1.1\n  - 小項目1.2\n  - 小項目1.3\n- 中項目2\n  - 小項目2.1\n  - 小項目2.2`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
    console.error("Error generating outline:", error)
    return NextResponse.json(
      { error: "アウトラインの生成中にエラーが発生しました" },
      { status: 500 }
    )
  }
} 