#!/usr/bin/env node
// DeepSeek APIを使用した見出し生成のCLIツール

const { generateHeadlines } = require('./deepseek_headline_generator');
const readline = require('readline');
const fs = require('fs').promises;

// コマンドライン引数の解析
const args = process.argv.slice(2);
const flags = {
  file: null,
  output: null,
  count: 5
};

// 引数の処理
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' || args[i] === '-f') {
    flags.file = args[i + 1];
    i++;
  } else if (args[i] === '--output' || args[i] === '-o') {
    flags.output = args[i + 1];
    i++;
  } else if (args[i] === '--count' || args[i] === '-c') {
    flags.count = parseInt(args[i + 1], 10) || 5;
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    showHelp();
    process.exit(0);
  }
}

// ヘルプ表示関数
function showHelp() {
  console.log(`
DeepSeek 見出し生成ツール

使用方法:
  node deepseek_headline_cli.js [オプション]

オプション:
  --file, -f <ファイルパス>   入力テキストを含むファイルのパス
  --output, -o <ファイルパス> 生成された見出しを保存するファイルのパス
  --count, -c <数値>         生成する見出し候補の数（デフォルト: 5）
  --help, -h                 ヘルプを表示

例:
  node deepseek_headline_cli.js -f input.txt -o headlines.txt -c 10
  `);
}

// 標準入力からテキストを読み取る関数
function readFromStdin() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('テキストを入力してください（入力を終了するには Ctrl+D または Ctrl+Z を押してください）:');
    
    let inputText = '';
    
    rl.on('line', (line) => {
      inputText += line + '\n';
    });
    
    rl.on('close', () => {
      resolve(inputText.trim());
    });
  });
}

// メイン処理
async function main() {
  try {
    let inputText;
    
    // 入力ソースの決定
    if (flags.file) {
      try {
        inputText = await fs.readFile(flags.file, 'utf8');
      } catch (error) {
        console.error(`ファイル読み込みエラー: ${error.message}`);
        process.exit(1);
      }
    } else {
      inputText = await readFromStdin();
    }
    
    if (!inputText) {
      console.error('エラー: 入力テキストが空です');
      process.exit(1);
    }
    
    // 見出し生成
    console.log('見出しを生成中...');
    const headlines = await generateHeadlines(inputText, flags.count);
    
    // 結果の出力
    if (flags.output) {
      await fs.writeFile(flags.output, headlines.join('\n'), 'utf8');
      console.log(`見出し候補が ${flags.output} に保存されました`);
    } else {
      console.log('\n生成された見出し候補:');
      headlines.forEach((headline, index) => {
        console.log(`${index + 1}. ${headline}`);
      });
    }
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
main(); 