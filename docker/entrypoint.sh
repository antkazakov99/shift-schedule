#!/bin/sh
# Prepares the SQLite database and Laravel caches, then starts the server (CMD).
set -e
cd /app

DB_FILE="${DB_DATABASE:-/data/database.sqlite}"
[ -f "$DB_FILE" ] || touch "$DB_FILE"

php artisan migrate --force

# Demo data only on the very first start; later restarts keep whatever users changed.
if [ ! -f /data/.seeded ]; then
    php artisan db:seed --force
    touch /data/.seeded
fi

php artisan optimize

exec "$@"
