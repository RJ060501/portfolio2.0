FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY src ./src
# Named volume inherits writable permissions from the image directory.
RUN mkdir -p /data && chown -R node:node /data /app
USER node
ENV DB_PATH=/data/trends.sqlite
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=7s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "src/server.js"]
