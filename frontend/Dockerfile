# frontend/Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production nginx stage (serve static)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config that proxies /rates to the backend service
COPY --from=build /app/nginx/default.conf /etc/nginx/conf.d/default.conf
RUN apk add --no-cache curl

# Docker-level healthcheck will query the served /health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD curl -fsS http://localhost/health || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
