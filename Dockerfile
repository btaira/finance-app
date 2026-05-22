FROM nginx:alpine

# Copy the static website files to the default Nginx html directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Expose port 80 to the outer network
EXPOSE 80

# Nginx starts automatically by default in the official image
CMD ["nginx", "-g", "daemon off;"]
