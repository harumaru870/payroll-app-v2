# Vercelデプロイ手順

## 1. Vercelアカウントの準備
1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでサインアップ/ログイン

## 2. プロジェクトのデプロイ

### 方法A: Vercel CLI（推奨）

```bash
# Vercel CLIのインストール
npm i -g vercel

# プロジェクトディレクトリで実行
cd /Users/haru/Web/payroll-app-v2

# デプロイ開始
vercel
```

初回デプロイ時の質問に回答:
- Set up and deploy? → Y
- Which scope? → 自分のアカウントを選択
- Link to existing project? → N
- What's your project's name? → payroll-app-v2 (またはお好きな名前)
- In which directory is your code located? → ./
- Want to override the settings? → N

### 方法B: Vercel Dashboard

1. [Vercel Dashboard](https://vercel.com/new)にアクセス
2. "Import Git Repository"をクリック
3. GitHubリポジトリを選択（まだプッシュしていない場合は、先にGitHubにプッシュ）
4. プロジェクト設定はデフォルトのままでOK（vercel.jsonで設定済み）

## 3. 環境変数の設定

Vercel Dashboardで環境変数を設定:

1. プロジェクトの Settings → Environment Variables に移動
2. 以下の環境変数を追加:

```
DATABASE_URL = postgresql://postgres.gazfeshlqncnmobcstju:$th2v9+JKuBWPF$@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

DIRECT_URL = postgresql://postgres.gazfeshlqncnmobcstju:$th2v9+JKuBWPF$@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

**重要**: Production, Preview, Development 全ての環境にチェックを入れてください。

## 4. 再デプロイ

環境変数を設定したら、Vercel Dashboardの "Deployments" タブから:
- 最新のデプロイメントの右側の "..." メニューをクリック
- "Redeploy" を選択

または、CLIから:
```bash
vercel --prod
```

## 5. データベースマイグレーション

初回デプロイ後、データベースのマイグレーションが自動実行されます（vercel.jsonに設定済み）。

もし手動で実行する必要がある場合:
```bash
# ローカルで実行（本番DBに対して）
npx prisma migrate deploy
```

## トラブルシューティング

### ビルドエラーが出る場合
- Vercel Dashboardのビルドログを確認
- 環境変数が正しく設定されているか確認

### データベース接続エラー
- DATABASE_URLとDIRECT_URLが正しいか確認
- Supabaseのデータベースが稼働しているか確認

## デプロイ後の確認

デプロイが完了すると、Vercelから自動生成されたURLが発行されます:
- `https://payroll-app-v2-xxx.vercel.app`

このURLにアクセスしてアプリが正常に動作するか確認してください。

## カスタムドメインの設定（オプション）

1. Vercel Dashboard → Settings → Domains
2. "Add Domain"をクリック
3. 独自ドメインを入力して設定

---

## 現在の設定内容

✅ package.json に postinstall スクリプト追加（Prisma Client自動生成）
✅ vercel.json でビルド設定完了
✅ .gitignore で .env ファイル除外済み
✅ Supabase PostgreSQL データベース設定済み

準備完了です！上記の手順でデプロイしてください。
