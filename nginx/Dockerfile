FROM nginx:1.21-alpine as base

RUN apk update && apk add --no-cache bash

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/symfony.conf.template /etc/nginx/templates/symfony.conf.template

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Development stage
FROM base as dev

# Create directory for logs
RUN mkdir -p /var/log/nginx

CMD ["nginx", "-g", "daemon off;"]

# Production stage
FROM base as prod

# Create directory for logs
RUN mkdir -p /var/log/nginx

# Copy built React files
COPY ../react/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]