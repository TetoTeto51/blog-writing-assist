import { NextResponse } from "next/server"
import axios from "axios"

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/beta/chat/completions"

export async function POST(request: Request) {
  try {
    const { theme } = await request.json()

    if (!theme) {
      return NextResponse.json(
        { error: "テーマが入力されていません" },
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
            content: "あなたはブログ記事の見出し生成の専門家です。与えられたテーマに基づいて、5つの魅力的な見出しを提案してください。"
          },
          {
            role: "user",
            content: `テーマ：${theme}\n見出しを5つ提案してください。`
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
    console.error("Error generating headings:", error)
    return NextResponse.json(
      { error: "見出しの生成中にエラーが発生しました" },
      { status: 500 }
    )
  }
} 