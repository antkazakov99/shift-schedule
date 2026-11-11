# syntax=docker/dockerfile:1
#
# Production image: FrankenPHP (Caddy + PHP 8.4) serving public/ on :8080.
# TLS is terminated by the reverse proxy in front; the app trusts its X-Forwarded-* headers.
# SQLite lives in the /data volume (DB_DATABASE=/data/database.sqlite).

FROM dunglas/frankenphp:1-php8.4-alpine AS base
RUN install-php-extensions intl bcmath pcntl opcache pdo_sqlite \
    && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
WORKDIR /app

# --- PHP dependencies -------------------------------------------------------------------------
FROM base AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev

# --- Frontend (type-check + Vite build) -------------------------------------------------------
FROM node:22-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Tailwind scans a few vendor views
COPY --from=vendor /app/vendor ./vendor
RUN npm run build

# --- Runtime ----------------------------------------------------------------------------------
FROM base
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/data/database.sqlite

COPY --from=vendor /app /app
COPY --from=assets /app/public/build /app/public/build
COPY docker/entrypoint.sh /usr/local/bin/entrypoint

# Runs as an unprivileged user (uid:gid 1026:100; match it to the owner of the mounted data folder).
# Port 8080 needs no capability; dropping the file capability keeps no-new-privileges working.
RUN apk add --no-cache libcap \
    && setcap -r /usr/local/bin/frankenphp \
    && chmod +x /usr/local/bin/entrypoint \
    && mkdir -p /data /config/caddy /data/caddy \
    && chown -R 1026:100 /app/storage /app/bootstrap/cache /data /config

USER 1026:100
EXPOSE 8080
VOLUME /data

# The base image checks the Caddy admin API (:2019), which `php-server` doesn't start.
# Check the app itself instead: Laravel's /up health route.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8080/up > /dev/null || exit 1

ENTRYPOINT ["entrypoint"]
CMD ["frankenphp", "php-server", "--listen", ":8080", "--root", "/app/public"]
