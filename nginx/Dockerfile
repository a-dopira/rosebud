FROM nginx:1.21-alpine

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY default.conf /etc/nginx/conf.d/

# Create directories if needed
RUN mkdir -p /usr/share/nginx/html
RUN mkdir -p /app/media

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]