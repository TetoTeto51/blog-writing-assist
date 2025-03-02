# ブログ記事執筆支援アプリケーション API設計書

## 1. API概要

### 1.1 基本方針
- RESTful API設計
- JSON形式でのデータ交換
- バージョニング（URLベース）
- 認証必須エンドポイント
- OpenAPI（Swagger）準拠

### 1.2 共通仕様
- ベースURL: `/api/v1`
- リクエストヘッダー
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}`
- レスポンスフォーマット
```json
{
  "status": "success" | "error",
  "data": {}, // レスポンスデータ
  "error": {  // エラー時のみ
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

## 2. エンドポイント一覧

### 2.1 認証・ユーザー管理

#### POST /auth/login
- ユーザーログイン
```json
Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

#### POST /auth/register
- ユーザー登録
```json
Request:
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

### 2.2 記事管理

#### POST /articles
- 新規記事作成
```json
Request:
{
  "theme": "string",
  "additionalInfo": "string"
}

Response:
{
  "articleId": "string",
  "status": "draft",
  "theme": "string"
}
```

#### GET /articles/{articleId}
- 記事詳細取得
```json
Response:
{
  "id": "string",
  "theme": "string",
  "headings": [],
  "outline": {},
  "content": {},
  "status": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### PUT /articles/{articleId}
- 記事更新
```json
Request:
{
  "theme": "string",
  "headings": [],
  "outline": {},
  "content": {},
  "status": "string"
}
```

#### GET /articles
- 記事一覧取得
```json
Response:
{
  "articles": [
    {
      "id": "string",
      "theme": "string",
      "status": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### 2.3 AI生成関連

#### POST /ai/headings
- 見出し候補生成
```json
Request:
{
  "theme": "string",
  "additionalInfo": "string"
}

Response:
{
  "headings": [
    {
      "id": "string",
      "title": "string",
      "description": "string"
    }
  ]
}
```

#### POST /ai/outline
- 目次生成
```json
Request:
{
  "theme": "string",
  "headings": ["string"]
}

Response:
{
  "outline": {
    "sections": [
      {
        "id": "string",
        "title": "string",
        "level": 1,
        "children": []
      }
    ]
  }
}
```

#### POST /ai/content
- セクション内容生成
```json
Request:
{
  "articleId": "string",
  "sectionId": "string",
  "context": {
    "theme": "string",
    "outline": {},
    "previousContent": "string"
  }
}

Response:
{
  "content": "string",
  "suggestions": ["string"]
}
```

### 2.4 編集・保存関連

#### POST /articles/{articleId}/autosave
- 自動保存
```json
Request:
{
  "content": {},
  "timestamp": "string"
}
```

#### GET /articles/{articleId}/revisions
- 変更履歴取得
```json
Response:
{
  "revisions": [
    {
      "id": "string",
      "timestamp": "string",
      "type": "string"
    }
  ]
}
```

#### POST /articles/{articleId}/publish
- 記事公開
```json
Request:
{
  "publishSettings": {
    "status": "published",
    "scheduledAt": "string"
  }
}
```

## 3. エラーハンドリング

### 3.1 エラーコード
- 400: バリデーションエラー
- 401: 認証エラー
- 403: 権限エラー
- 404: リソース未発見
- 429: レート制限超過
- 500: サーバーエラー

### 3.2 エラーレスポンス例
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [
      {
        "field": "theme",
        "message": "テーマは必須です"
      }
    ]
  }
}
```

## 4. レート制限

### 4.1 基本制限
- 認証済みユーザー: 100 リクエスト/分
- AI生成エンドポイント: 20 リクエスト/分

### 4.2 ヘッダー
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1623456789
```

## 5. キャッシュ戦略

### 5.1 キャッシュヘッダー
```
Cache-Control: private, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

### 5.2 キャッシュ対象
- 記事一覧: 5分
- 記事詳細: 1時間
- ユーザープロフィール: 1時間 