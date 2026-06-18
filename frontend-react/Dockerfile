# ─── STAGE 1: Builder ───────────────────────────────────────────
# Build the React/Vite app into static HTML/CSS/JS files
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies
# (we need devDependencies here for Vite to build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Run Vite build — creates a dist/ folder with static files
RUN npm run build

# ─── STAGE 2: Runner ────────────────────────────────────────────
# We don't need Node.js to serve static files!
# Nginx is a lightweight web server — perfect for this
FROM nginx:alpine AS runner

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from builder into nginx's serve folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config (we'll create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx runs on port 80
EXPOSE 80

# Start nginx in foreground (containers need a foreground process)
CMD ["nginx", "-g", "daemon off;"]