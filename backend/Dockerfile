# Pinned Node 22 image so the lockfile resolution is reproducible
# regardless of which npm version generated it locally.
FROM node:22-bookworm-slim

WORKDIR /app

# Build tools for better-sqlite3's native binding
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# `npm install` (not `npm ci`) so the build is tolerant of lockfile drift
# across npm major versions. Railway's npm 10 resolves some transitive deps
# differently from my local npm 11, which makes `npm ci` fail with
# "Missing: webpack@5.106.2 from lock file" even though the lockfile is correct.
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV DB_DRIVER=sqlite
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/main"]
