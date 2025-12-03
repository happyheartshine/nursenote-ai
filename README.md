# NurseNote AI

精神科訪問看護 記録支援アプリケーション

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数の設定:
`.env.local` ファイルを作成し、以下を設定してください:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. 開発サーバーの起動:
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

```bash
npm run build
npm start
```

## 認証

このアプリケーションは Supabase を使用した認証を実装しています。

### 認証方法

- **Email + パスワード**: 新規登録、ログイン、パスワードリセット
- **OAuth プロバイダー**: Google、Microsoft / Outlook
- **認証フロー**: Supabase 認証を使用
- **保護されたエンドポイント**: `/generate` API エンドポイントは認証が必要です

### 認証機能

1. **新規登録**: Email とパスワードでアカウントを作成（確認メール送信）
2. **ログイン**: Email + パスワードまたは OAuth でログイン
3. **パスワードリセット**: メールアドレスを入力してリセットメールを受信
4. **OAuth ログイン**: Google または Microsoft/Outlook アカウントでログイン

### Supabase セットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. Authentication → Providers で Google と Azure (Microsoft) を有効化
3. Settings → API から以下を取得:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - JWT Secret → バックエンドの `SUPABASE_JWT_SECRET` (Settings → API → JWT Secret)

### バックエンド環境変数

バックエンドの `.env` ファイルに以下を追加:
```
SUPABASE_PROJECT_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
```

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (認証)
- FastAPI (バックエンド)

