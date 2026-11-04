#!/usr/bin/env bash
# Deploy Sistem Audit GMP (Docker + Cloudflare Tunnel shared-network).
#
#   ./deploy.sh --first   deploy pertama (tanpa git pull, + seed role & permission)
#   ./deploy.sh           deploy berikutnya (git pull, build, migrate, seed master data, cache ulang)

set -euo pipefail

cd "$(dirname "$0")"

FIRST=false
if [[ "${1:-}" == "--first" ]]; then
    FIRST=true
fi

NETWORK=shared-network
MYSQL_CONTAINER=audit-mysql

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m[x] %s\033[0m\n' "$*"; exit 1; }

[[ -f .env ]] || fail "File .env belum ada. Jalankan: cp .env.production.example .env lalu isi (lihat docs/DEPLOYMENT-SELFHOST-CLOUDFLARE-AUDIT.md)."

grep -qE '^DB_PASSWORD=GANTI_' .env && fail "DB_PASSWORD di .env masih default. Isi dulu (langkah 3b)."
grep -qE '^DB_ROOT_PASSWORD=GANTI_' .env && fail "DB_ROOT_PASSWORD di .env masih default. Isi dulu (langkah 3b)."

HOST_UID="$(grep -E '^HOST_UID=' .env | cut -d= -f2 | tr -d '[:space:]')"
HOST_GID="$(grep -E '^HOST_GID=' .env | cut -d= -f2 | tr -d '[:space:]')"
HOST_UID="${HOST_UID:-1000}"
HOST_GID="${HOST_GID:-1000}"

if [[ "$HOST_UID" == "0" || "$HOST_GID" == "0" ]]; then
    fail "HOST_UID/HOST_GID tidak boleh 0 (root) — php-fpm menolak jalan sebagai root. Set ke 1000: sed -i 's|^HOST_UID=.*|HOST_UID=1000|; s|^HOST_GID=.*|HOST_GID=1000|' .env"
fi

if [[ "$(id -u)" == "0" ]]; then
    warn "Script dijalankan sebagai root — menyerahkan folder ke ${HOST_UID}:${HOST_GID}."
    chown -R "${HOST_UID}:${HOST_GID}" .
    git config --global --get-all safe.directory | grep -qxF "$(pwd)" || git config --global --add safe.directory "$(pwd)"
fi

step "Cek network ${NETWORK}"
docker network inspect "$NETWORK" >/dev/null 2>&1 || docker network create "$NETWORK"
if ! docker network inspect "$NETWORK" --format '{{range .Containers}}{{.Name}} {{end}}' | grep -qi cloudflared; then
    warn "Container cloudflared tidak terdeteksi di ${NETWORK}. Tunnel tidak akan bisa menjangkau audit-nginx (502)."
    warn "Perbaiki: docker network connect ${NETWORK} <NAMA_CONTAINER_CLOUDFLARED>"
fi

if [[ "$FIRST" == false ]]; then
    step "git pull"
    git pull --ff-only
fi

step "Build image app"
docker compose build app

step "Start mysql & tunggu sampai healthy"
docker compose up -d mysql
for i in $(seq 1 60); do
    status="$(docker inspect -f '{{.State.Health.Status}}' "$MYSQL_CONTAINER" 2>/dev/null || echo starting)"
    [[ "$status" == "healthy" ]] && break
    [[ "$i" == 60 ]] && fail "MySQL tidak healthy setelah 3 menit. Cek: docker compose logs mysql"
    echo "menunggu mysql sehat... (${status})"
    sleep 3
done

step "Start app & nginx"
docker compose up -d app nginx

step "composer install"
docker compose exec -T app composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

step "Build asset frontend (npm ci && npm run build)"
docker run --rm \
    --user "${HOST_UID}:${HOST_GID}" \
    -e HOME=/tmp \
    -v "$(pwd)":/var/www/html \
    -w /var/www/html \
    node:20 sh -c "npm ci --no-audit --no-fund && npm run build"

step "APP_KEY & storage:link"
if ! grep -qE '^APP_KEY=base64:.+' .env; then
    warn "APP_KEY kosong — generate. Container perlu dibuat ulang agar memakai key baru."
    docker compose exec -T app php artisan key:generate --force
    docker compose up -d --force-recreate app
fi
[[ -L public/storage ]] || docker compose exec -T app php artisan storage:link

step "migrate"
docker compose exec -T app php artisan migrate --force

if [[ "$FIRST" == true ]]; then
    step "Seed role & permission (tanpa data dummy)"
    docker compose exec -T app php artisan db:seed --class=RoleSeeder --force
fi

step "Seed master data referensi (idempoten, tidak menimpa perubahan admin)"
docker compose exec -T app php artisan db:seed --class=MasterDataSeeder --force

step "optimize (cache config/route/view/event)"
docker compose exec -T app php artisan optimize:clear >/dev/null
docker compose exec -T app php artisan optimize

if [[ "$FIRST" == false ]]; then
    step "Restart app"
    docker compose restart app
fi

step "Cek kesehatan"
port="$(grep -E '^APP_PORT=' .env | cut -d= -f2)"
port="${port:-8084}"
sleep 2
if curl -fsS -o /dev/null "http://127.0.0.1:${port}/up"; then
    printf '\033[1;32m[OK] http://127.0.0.1:%s/up -> 200\033[0m\n' "$port"
else
    warn "http://127.0.0.1:${port}/up tidak 200. Cek: docker compose logs app nginx && tail storage/logs/laravel-*.log"
fi

docker compose ps
