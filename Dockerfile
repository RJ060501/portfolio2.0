# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Optional development target. Compose mounts only editable source/config files.
FROM dependencies AS development
COPY --chown=node:node . .
RUN mkdir -p .next && chown node:node /app /app/.next
USER node
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

FROM dependencies AS builder
COPY . .
RUN npm test && npm run build

# This portfolio is a static Next.js export. Node is not needed at runtime.
FROM nginx:1.28-alpine AS production
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder --chown=nginx:nginx /app/out /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
# Bypass the image's root-oriented configuration scripts; the config is complete.
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
