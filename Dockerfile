# =============================================================================
# Dockerfile — WA Agent with auto-update from Git
# =============================================================================
# This is a single-stage runtime image. The actual build happens at container
# startup (entrypoint.sh) from the cloned git repo, so that the container can
# rebuild itself when it detects new commits.
# =============================================================================

FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    nginx \
    git \
    bash \
    socat \
    curl \
    tzdata

# Set timezone (overridable via env)
ENV TZ=Asia/Jakarta
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create directories
RUN mkdir -p /app/repo /app/scripts /usr/share/nginx/html /var/log

# Copy Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy scripts
COPY scripts/ /app/scripts/
RUN chmod +x /app/scripts/*.sh

# Environment variables (can be overridden in docker-compose)
ENV GIT_REPO_URL=https://github.com/IvanRRiadhy/WAAPI.git
ENV GIT_BRANCH=main

# Expose port 80 (Nginx)
EXPOSE 80

# Use entrypoint script
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
