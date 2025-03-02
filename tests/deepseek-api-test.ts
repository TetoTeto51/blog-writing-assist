import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/beta/chat/completions';

async function generateHeadings(theme: string) {
  try {
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
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// テスト実行
async function runTest() {
  try {
    const testTheme = "プログラミング初心者向けのTypeScript入門";
    console.log('テストテーマ:', testTheme);
    
    const result = await generateHeadings(testTheme);
    console.log('API応答:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('テストエラー:', error);
  }
}

runTest(); 