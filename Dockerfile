# ビルドステージ
FROM node:18-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install        # ← devDependencies もインストールする

COPY . .
RUN npm run build

# 実行ステージ
FROM node:18-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# ビルド成果物をコピー
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public

ENV PORT=8080
CMD ["npm", "run", "start", "--", "-p", "8080"]