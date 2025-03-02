// DeepSeek APIを使用して見出し候補を生成するテストスクリプト

const axios = require('axios');
require('dotenv').config();

// DeepSeek APIの設定
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

/**
 * 入力テキストから見出し候補を生成する関数
 * @param {string} inputText - 見出しを生成するための入力テキスト
 * @param {number} numHeadlines - 生成する見出し候補の数（デフォルト: 5）
 * @returns {Promise<string[]>} - 生成された見出し候補の配列
 */
async function generateHeadlines(inputText, numHeadlines = 5) {
  try {
    // APIリクエストの設定
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `あなたは見出し生成の専門家です。与えられたテキストを分析し、魅力的で内容を適切に表現する${numHeadlines}個の見出し候補を生成してください。見出しは簡潔で、読者の興味を引くものにしてください。`
          },
          {
            role: 'user',
            content: `以下のテキストに対して${numHeadlines}個の見出し候補を生成してください。各見出しは50文字以内にしてください。\n\n${inputText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    // レスポンスから見出し候補を抽出
    const content = response.data.choices[0].message.content;
    
    // 行ごとに分割して、番号や記号を取り除いて見出しのみを抽出
    const headlines = content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[0-9\.\-\*]+\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, numHeadlines);

    return headlines;
  } catch (error) {
    console.error('見出し生成中にエラーが発生しました:', error.response?.data || error.message);
    throw new Error('見出し生成に失敗しました');
  }
}

/**
 * テスト実行用の関数
 */
async function testHeadlineGenerator() {
  const sampleText = `
  人工知能（AI）技術は近年急速に発展し、様々な産業に革命をもたらしています。
  特に自然言語処理の分野では、大規模言語モデルの登場により、人間のような文章生成や理解が可能になりました。
  これにより、カスタマーサポート、コンテンツ作成、翻訳など多くの業務が自動化されつつあります。
  一方で、AIの普及に伴い、プライバシーの問題や雇用への影響、倫理的な課題も浮上しています。
  今後は技術の発展と同時に、適切な規制やガイドラインの整備が重要になるでしょう。
  `;

  try {
    console.log('見出し生成を開始します...');
    const headlines = await generateHeadlines(sampleText);
    
    console.log('\n生成された見出し候補:');
    headlines.forEach((headline, index) => {
      console.log(`${index + 1}. ${headline}`);
    });
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
  }
}

// テスト実行（コマンドライン引数で直接実行された場合のみ）
if (require.main === module) {
  testHeadlineGenerator();
}

// モジュールとしてエクスポート
module.exports = {
  generateHeadlines
}; 