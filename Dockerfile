FROM nginx:stable-alpine

#COPY --from=builder /app/.nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g","daemon off;"]