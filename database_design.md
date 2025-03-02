# ブログ記事執筆支援アプリケーション データベース設計書

## 1. 概要

### 1.1 データベース選定
- メインDB: PostgreSQL 15
- キャッシュ: Redis
- ORM: Prisma

### 1.2 設計方針
- 正規化の徹底
- パフォーマンスを考慮したインデックス設計
- 柔軟な拡張性の確保
- データ整合性の担保

## 2. テーブル定義

### 2.1 users
ユーザー情報を管理するテーブル

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    
    CONSTRAINT users_status_check 
        CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_users_email ON users(email);
```

### 2.2 articles
記事の基本情報を管理するテーブル

```sql
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    theme VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_articles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    
    CONSTRAINT articles_status_check
        CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_status ON articles(status);
```

### 2.3 article_versions
記事のバージョン管理を行うテーブル

```sql
CREATE TABLE article_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    content JSONB NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_article_versions_article
        FOREIGN KEY (article_id)
        REFERENCES articles(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_article_versions_article_id ON article_versions(article_id);
```

### 2.4 headings
記事の見出し候補を管理するテーブル

```sql
CREATE TABLE headings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_selected BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_headings_article
        FOREIGN KEY (article_id)
        REFERENCES articles(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_headings_article_id ON headings(article_id);
```

### 2.5 outlines
記事の目次構造を管理するテーブル

```sql
CREATE TABLE outlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    structure JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_outlines_article
        FOREIGN KEY (article_id)
        REFERENCES articles(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_outlines_article_id ON outlines(article_id);
```

### 2.6 sections
記事のセクション内容を管理するテーブル

```sql
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    outline_id UUID NOT NULL,
    content TEXT,
    order_index INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_sections_article
        FOREIGN KEY (article_id)
        REFERENCES articles(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_sections_outline
        FOREIGN KEY (outline_id)
        REFERENCES outlines(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_sections_article_id ON sections(article_id);
CREATE INDEX idx_sections_outline_id ON sections(outline_id);
```

### 2.7 ai_generations
AI生成履歴を管理するテーブル

```sql
CREATE TABLE ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    section_id UUID,
    generation_type VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    result TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ai_generations_article
        FOREIGN KEY (article_id)
        REFERENCES articles(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_ai_generations_section
        FOREIGN KEY (section_id)
        REFERENCES sections(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_ai_generations_article_id ON ai_generations(article_id);
```

## 3. インデックス戦略

### 3.1 主要インデックス
- ユーザーメールアドレス（一意性）
- 記事ステータス（検索・フィルタリング）
- 記事更新日時（ソート）
- セクション順序（ソート）

### 3.2 複合インデックス
```sql
CREATE INDEX idx_articles_user_status ON articles(user_id, status);
CREATE INDEX idx_sections_article_order ON sections(article_id, order_index);
```

## 4. バックアップ戦略

### 4.1 定期バックアップ
- フルバックアップ: 毎日
- 差分バックアップ: 6時間ごと
- トランザクションログ: リアルタイム

### 4.2 リテンション期間
- フルバックアップ: 30日
- 差分バックアップ: 7日
- トランザクションログ: 3日

## 5. パフォーマンスチューニング

### 5.1 パーティショニング
- articles テーブル: 月次パーティショニング
- ai_generations テーブル: 月次パーティショニング

### 5.2 キャッシュ戦略
**Redisキャッシュ構造**
```
# ユーザーセッション
user:{userId}:session -> { sessionData }

# 記事キャッシュ
article:{articleId}:data -> { articleData }
article:{articleId}:outline -> { outlineData }

# AI生成結果
ai:generation:{generationId} -> { generationResult }
```

## 6. マイグレーション戦略

### 6.1 Prismaマイグレーション
```prisma
// 例：記事テーブルの定義
model Article {
  id          String   @id @default(uuid())
  userId      String
  theme       String
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  
  user        User     @relation(fields: [userId], references: [id])
  versions    ArticleVersion[]
  headings    Heading[]
  outlines    Outline[]
  sections    Section[]
  
  @@index([userId])
  @@index([status])
}
```

### 6.2 ロールバック計画
- マイグレーション実行前のスナップショット作成
- ダウンタイムを最小限に抑えた実行計画
- 段階的なマイグレーション実施 