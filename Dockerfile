# Build Onlook web client
FROM oven/bun:1

WORKDIR /app

# Set build and production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV STANDALONE_BUILD=true
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Render exposes service environment variables to Docker builds as build args.
# Declare the required keys so Next.js env validation passes during `build:standalone`.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG SUPABASE_DATABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ARG CSB_API_KEY
ARG OPENROUTER_API_KEY

# Copy everything (monorepo structure)
COPY . .

# Install dependencies and build
RUN export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}" \
    NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
    NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    SUPABASE_URL="${SUPABASE_URL}" \
    SUPABASE_DATABASE_URL="${SUPABASE_DATABASE_URL}" \
    SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}" \
    CSB_API_KEY="${CSB_API_KEY}" \
    OPENROUTER_API_KEY="${OPENROUTER_API_KEY}" \
    && bun install --frozen-lockfile \
    && cd apps/web/client \
    && bun run build:standalone

# Expose the application port
EXPOSE 3000

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun -e "fetch('http://localhost:3000').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the Next.js standalone server
CMD ["bun", "apps/web/client/.next/standalone/apps/web/client/server.js"]
