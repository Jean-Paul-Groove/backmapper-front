FROM node:18-alpine AS builder

ARG API_URL
ENV API_URL=$API_URL

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

FROM nginx:stable-alpine AS proxy

#COPY --from=builder /app/.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g","daemon off;"]