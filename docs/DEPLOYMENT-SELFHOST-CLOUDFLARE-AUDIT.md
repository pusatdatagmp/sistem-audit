# DEPLOYMENT: Sistem Audit GMP — Docker + Cloudflare Tunnel (shared dengan task-management & absensi)

> VPS ini sudah menjalankan stack `task-management` (app, scheduler, queue-worker,
> reverb, mysql, nginx, **cloudflared** — tunnel aktif) dan stack `absensi`.
> Sistem Audit GMP jalan sebagai stack Docker Compose **terpisah**, tapi
> **memakai tunnel `cloudflared` yang sudah ada** — tidak bikin tunnel/container
> `cloudflared` baru. App ini tidak punya Reverb/queue-worker/scheduler
> (kodenya tidak memakainya — tidak ada `app/Jobs`, tidak ada scheduled task di
> `routes/console.php`), jadi stack-nya cuma 3 container: `app` (PHP-FPM),
> `nginx`, `mysql`. `Dockerfile`, `docker-compose.yml`, dan
> `docker/nginx/default.conf` sudah disiapkan di root repo ini.

**Cara nyambung:** nginx audit ikut satu Docker network eksternal
(`shared-network`) yang juga di-join-kan ke container `cloudflared` yang
sudah jalan. Cloudflare Tunnel lalu di-route ke `audit-nginx:80` lewat
network itu — tanpa expose port apa pun ke publik, tanpa tunnel baru.

Catatan: `shared-network` ini **sama persis** dengan yang dipakai stack
`absensi`. Kalau sudah pernah dibuat & disambungkan ke `cloudflared` waktu
deploy absensi, langkah 0 di bawah **tidak perlu diulang** — cukup pastikan
networknya masih ada (`docker network inspect shared-network`).

---

## 0. Sekali saja: siapkan shared network & sambungkan ke cloudflared existing

Cek dulu apakah `shared-network` sudah ada (misal dari deploy absensi):

```bash
docker network inspect shared-network >/dev/null 2>&1 && echo "sudah ada" || echo "belum ada"
```

Kalau **belum ada**, cari nama container `cloudflared` yang sedang jalan:

```bash
docker ps --format '{{.Names}}\t{{.Image}}' | grep -i cloudflared
```

Catat nama containernya (misal `task-management-cloudflared-1`), lalu:

```bash
docker network create shared-network
docker network connect shared-network <NAMA_CONTAINER_CLOUDFLARED>
```

Ini **live** — tidak perlu restart tunnel, task-management/absensi tetap jalan normal selama proses ini.

🔴 Catatan durabilitas: kalau suatu saat container `cloudflared` itu di-*recreate* (`docker compose down && up` di stack task-management), koneksi network manual ini hilang dan perintah `docker network connect` di atas perlu diulang. Supaya permanen, idealnya tambahkan `shared-network` (sebagai `external: true`) ke service `cloudflared` di `docker-compose.yml` milik task-management juga — opsional, tidak wajib untuk deploy pertama kali.

---

## 1. Clone & konfigurasi env

```bash
sudo mkdir -p /opt/apps/audit && sudo chown -R $USER:$USER /opt/apps/audit
cd /opt/apps/audit
git clone <url-repo-sistem-audit-gmp> .
cp .env.example .env
nano .env
```

Isi/pastikan nilai berikut di `.env`:

```env
APP_NAME="Audit Deevatech"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://audit.deevatech.my.id

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=audit_gmp
DB_USERNAME=audit_user
DB_PASSWORD=<password-kuat-baru>
DB_ROOT_PASSWORD=<password-root-kuat-baru>

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=sync

FONNTE_TOKEN=<token-device-dari-dashboard-fonnte.com>
FONNTE_API_URL=https://api.fonnte.com/send
FONNTE_ADMIN_NUMBER=6285172347665
```

🔴 `FONNTE_TOKEN` didapat dari dashboard [fonnte.com](https://fonnte.com) setelah device WhatsApp di-scan QR (paket gratis, 1 device). Tanpa token ini, notifikasi hanya ditulis ke `storage/logs/laravel.log` sebagai warning dan tidak mengganggu fitur lain (gagal kirim WA tidak membatalkan pembuatan tiket/equipment request).

🔴 `DB_PASSWORD`/`DB_ROOT_PASSWORD` langsung dipakai sebagai `MYSQL_PASSWORD`/`MYSQL_ROOT_PASSWORD` oleh service `mysql` di `docker-compose.yml` — cukup ubah di `.env`, tidak perlu sentuh `docker-compose.yml`.

🔴 `QUEUE_CONNECTION=sync` karena stack ini **tidak** punya container queue-worker — app tidak memakai queued job sama sekali (tidak ada `app/Jobs`), jadi `sync` lebih aman daripada `database` (yang akan menumpuk row di tabel `jobs` tanpa pernah diproses).

---

## 2. Build & jalankan (copy-paste satu blok)

```bash
cd /opt/apps/audit

# shared-network harus sudah ada dari langkah 0 (compose butuh ini saat "up")
docker network inspect shared-network >/dev/null 2>&1 || docker network create shared-network

docker compose build
docker compose up -d mysql

until docker inspect -f '{{.State.Health.Status}}' audit-mysql 2>/dev/null | grep -q healthy; do
  echo "menunggu mysql sehat..."; sleep 3
done

docker compose up -d app nginx

docker compose exec app composer install --no-dev --optimize-autoloader --no-interaction
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --force
docker compose exec app php artisan storage:link
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache

docker run --rm -v "$(pwd)":/var/www/html -w /var/www/html node:20 sh -c "npm ci && npm run build"

sudo chown -R www-data:www-data storage bootstrap/cache public/build
sudo chmod -R 775 storage bootstrap/cache
```

Kenapa `composer install`/`npm run build` dijalankan manual setelah container hidup, bukan cuma andalkan `Dockerfile`: `vendor/` dan `node_modules/`/`public/build` datang dari bind mount host (`.:/var/www/html`), jadi hasil build image bisa tertutup mount tersebut — menjalankannya di sini menjamin isinya benar-benar ada di host.

---

## 3. Cloudflare Zero Trust Dashboard — tambah route, TANPA halaman login

1. **Networks → Tunnels** → pilih tunnel yang sudah dipakai task-management/absensi (yang statusnya aktif).
2. Tab **Public Hostname → Add a public hostname**:
   - **Subdomain**: `audit`
   - **Domain**: `deevatech.my.id`
   - **Service → Type**: `HTTP`
   - **Service → URL**: `audit-nginx:80`
3. **Save** — selesai. Tidak perlu isi apa pun di bagian **Access** pada form ini.

🔴 Supaya **tidak** memicu halaman login Cloudflare Access: jangan bikin **Access Application** baru untuk `audit.deevatech.my.id` di menu **Access → Applications**. Tab "Public Hostname" pada Tunnel itu murni routing HTTP, beda fitur dari Access. Kalau sebelumnya sudah ada Access Application dengan domain wildcard (`*.deevatech.my.id`), hostname baru ini akan otomatis ikut ter-proteksi login — cek dulu di **Access → Applications**, dan kalau ada, tambahkan exception/bypass untuk `audit.deevatech.my.id` atau pastikan tidak ada wildcard yang mencakupnya.

---

## 4. Checklist verifikasi

- [ ] `https://audit.deevatech.my.id` terbuka langsung (tanpa halaman login Cloudflare Access), SSL valid
- [ ] Login & fitur utama (master data, kitchen, vehicle, complaint ticket, equipment request, dsb.) berfungsi
- [ ] Upload foto (misal foto complaint ticket) tersimpan & tampil lewat `storage:link` dengan benar
- [ ] `docker compose ps` (di `/opt/apps/audit`) → semua `Up`/`healthy`
- [ ] `docker network inspect shared-network` → menunjukkan container cloudflared, `absensi-nginx` (kalau ada), **dan** `audit-nginx` sama-sama terhubung
- [ ] `https://task.deevatech.my.id` & `https://absensi.deevatech.my.id` tetap normal (tidak terganggu)
- [ ] Dari luar, `http://<ip-vps>:8083` **harus gagal connect** (bukti nginx audit cuma bind ke `127.0.0.1`)

---

## 5. Update kode saat deploy berikutnya

```bash
cd /opt/apps/audit
git pull
docker compose exec app composer install --no-dev --optimize-autoloader --no-interaction
docker run --rm -v "$(pwd)":/var/www/html -w /var/www/html node:20 sh -c "npm ci && npm run build"
docker compose exec app php artisan migrate --force
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
sudo chown -R www-data:www-data storage bootstrap/cache public/build
docker compose restart app
```

Tidak ada scheduler/queue-worker/reverb untuk di-restart — app ini tidak memakainya. Tidak ada yang perlu diubah lagi di sisi Cloudflare untuk deploy berikutnya.

---

## 6. File Docker yang disiapkan di repo ini

- `Dockerfile` — PHP 8.3-FPM (Alpine) + extension yang dipakai Laravel 12 (`pdo_mysql`, `mbstring`, `exif`, `pcntl`, `bcmath`, `gd`, `zip`, `intl`, `opcache`) + Composer. Tidak men-`COPY` kode aplikasi — kode datang dari bind mount (lihat Bagian 2).
- `docker-compose.yml` — 3 service (`mysql`, `app`, `nginx`), port nginx cuma bind ke `127.0.0.1:8083` di host, join `shared-network` (external) supaya bisa di-route lewat tunnel yang sama.
- `docker/nginx/default.conf` — vhost standar Laravel (`try_files` ke `index.php`, `fastcgi_pass app:9000`), `client_max_body_size 20M` (naikkan kalau ada upload foto/dokumen yang lebih besar).
