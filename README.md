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

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

