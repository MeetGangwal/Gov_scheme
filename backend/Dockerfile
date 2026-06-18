# ─── STAGE 1: Builder ───────────────────────────────────────────
# We use a full Node image just to install dependencies
# "alpine" = a tiny 5MB Linux distro, much smaller than Ubuntu
FROM node:20-alpine AS builder

# Set working directory inside the container
# All future commands run from here
WORKDIR /app

# Copy ONLY package files first — not your source code yet
# Why? Docker caches layers. If package.json didn't change,
# it won't re-run npm ci on every build — much faster.
COPY package*.json ./

# Install only production dependencies (no devDependencies)
# npm ci = clean install, faster and stricter than npm install
RUN npm ci --only=production

# ─── STAGE 2: Runner ────────────────────────────────────────────
# Fresh minimal image — we copy only what we need from builder
# This means no build tools, no npm cache, no junk in final image
FROM node:20-alpine AS runner

WORKDIR /app

# Security best practice: don't run as root inside container
# Create a non-root user called "nodejs"
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Copy installed node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy your actual source code
# NEW — copy everything needed
COPY src/ ./src/
COPY index.js ./
COPY package*.json ./

# Switch to non-root user
USER nodejs

# Tell Docker this container listens on port 5000
# This is documentation — doesn't actually open the port
EXPOSE 5000

# The command that runs when container starts
CMD ["node", "index.js"]