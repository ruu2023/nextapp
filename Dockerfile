# ビルドステージ
FROM node:18-slim AS builder
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# パッケージを先にコピーして install
COPY package*.json ./
RUN npm install

# Prisma スキーマとソースをコピー
COPY prisma ./prisma
COPY . .

# Prisma Client を生成
RUN npx prisma generate

# Next.js をビルド
RUN npm run build

# 実行ステージ
FROM node:18-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# ビルド成果物をコピー
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public

# Prisma Client をコピー
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV PORT=8080
CMD ["npm", "run", "start", "--", "-p", "8080"]