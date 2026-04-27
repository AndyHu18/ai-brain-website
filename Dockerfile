FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache \
    cairo cairo-dev \
    pango pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    pkgconfig \
    python3 \
    make \
    g++

COPY package.json package-lock.json* ./
RUN npm install --omit=dev express && npm cache clean --force

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
