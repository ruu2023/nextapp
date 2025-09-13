おお〜 🎉 Cloud Run にデプロイ成功おめでとうございます！  
次は **CI/CD (GitHub Actions → Cloud Run)** ですね。  

たとえば GitHub Actions のワークフロー (`.github/workflows/deploy.yml`) を作ると、自動で Docker ビルド & Cloud Run デプロイが走るようにできます。  

---

### ✅ GitHub Actions 用 `deploy.yml` サンプル

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main   # main ブランチに push されたら実行（適宜変更してください）

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source
        uses: actions/checkout@v4

      - name: Set up gcloud
        uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          export_default_credentials: true

      - name: Configure Docker
        run: gcloud auth configure-docker gcr.io --quiet

      - name: Build and push Docker image
        run: |
          IMAGE="gcr.io/${{ secrets.GCP_PROJECT_ID }}/nextjs-app:${{ github.sha }}"
          gcloud builds submit --tag $IMAGE

      - name: Deploy to Cloud Run
        run: |
          IMAGE="gcr.io/${{ secrets.GCP_PROJECT_ID }}/nextjs-app:${{ github.sha }}"
          gcloud run deploy nextjs-app \
            --image $IMAGE \
            --region asia-northeast1 \
            --platform managed \
            --allow-unauthenticated
```

---

### ✅ 必要な設定

1. **サービスアカウント作成**
   - IAM & 管理 → サービスアカウントを作成
   - 権限: `Cloud Run Admin`, `Storage Admin`, `Service Account User`
   - キーを JSON で発行 → GitHub Secrets に登録

2. **GitHub Secrets 設定**
   - `GCP_PROJECT_ID`: GCP プロジェクト ID  
   - `GCP_SA_KEY`: 上の JSON キーの内容（そのままコピペ）

---

### 💡 ポイント
- デプロイ先サービス名 (`nextjs-app`) は Cloud Run で指定したものに合わせてください。
- ビルドに `gcloud builds submit` を使っているので、Artifact Registry/Container Registry 両方OK。  
  （`docker build + docker push` に変えても可）
- `github.sha` をタグにするとコミット単位で追跡できて便利です。  

---
