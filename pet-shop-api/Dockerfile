FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV DATABASE_URL=postgresql://petshop:petshop123@postgres:5432/petshop
RUN npm run prisma:generate
RUN npm run build

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/server.ts"]
