FROM node:18

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
RUN pnpm install

WORKDIR /app/apps/event-server

RUN pnpm run build

CMD ["node", "dist/main.js"]