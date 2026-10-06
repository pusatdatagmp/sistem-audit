# DEPLOYMENT: Absensi — Docker + Cloudflare Tunnel (shared dengan task-management)

> VPS ini sudah menjalankan stack `task-management` (app, scheduler, queue-worker,
> reverb, mysql, nginx, **cloudflared** — tunnel aktif). Absensi jalan sebagai
> stack Docker Compose **terpisah**, tapi **memakai tunnel `cloudflared` yang
> sudah ada** — tidak bikin tunnel/container `cloudflared` baru. Absensi tidak
> punya Reverb/queue-worker/scheduler (kodenya tidak memakainya), jadi stack-nya
> cuma 3 container: `app` (PHP-FPM), `nginx`, `mysql`.

**Cara nyambung:** nginx absensi ikut satu Docker network eksternal
(`shared-network`) yang juga di-join-kan ke container `cloudflared` yang
sudah jalan. Cloudflare Tunnel lalu di-route ke `absensi-nginx:80` lewat
network itu — tanpa expose port apa pun ke publik, tanpa tunnel baru.

---

## 0. Sekali saja: siapkan shared network & sambungkan ke cloudflared existing

Cari nama container `cloudflared` yang sedang jalan:

```bash
docker ps --format '{{.Names}}\t{{.Image}}' | grep -i cloudflared
```

Catat nama containernya (misal `task-management-cloudflared-1`), lalu:

```bash
docker network inspect shared-network >/dev/null 2>&1 || docker network create shared-network
docker network connect shared-network <NAMA_CONTAINER_CLOUDFLARED>
```

Ini **live** — tidak perlu restart tunnel, task-management tetap jalan normal selama proses ini.

🔴 Catatan durabilitas: kalau suatu saat container `cloudflared` itu di-*recreate* (`docker compose down && up` di stack task-management), koneksi network manual ini hilang dan perintah `docker network connect` di atas perlu diulang. Supaya permanen, idealnya tambahkan `shared-network` (sebagai `external: true`) ke service `cloudflared` di `docker-compose.yml` milik task-management juga — opsional, tidak wajib untuk deploy pertama kali.

---

## 1. Clone & konfigurasi env

```bash
sudo mkdir -p /opt/apps/absensi && sudo chown -R $USER:$USER /opt/apps/absensi
cd /opt/apps/absensi
git clone <url-repo-absensi> .
cp .env.example .env
nano .env
```

Isi/pastikan nilai berikut di `.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://absensi.deevatech.my.id

DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=absensi_karyawan
DB_USERNAME=absensi_user
DB_PASSWORD=<password-kuat-baru>
DB_ROOT_PASSWORD=<password-root-kuat-baru>
```

🔴 `DB_PASSWORD`/`DB_ROOT_PASSWORD` langsung dipakai sebagai `MYSQL_PASSWORD`/`MYSQL_ROOT_PASSWORD` oleh service `mysql` di `docker-compose.yml` — cukup ubah di `.env`, tidak perlu sentuh `docker-compose.yml`.

---

## 2. Build & jalankan (copy-paste satu blok)

```bash
cd /opt/apps/absensi

# shared-network harus sudah ada dari langkah 0 (compose butuh ini saat "up")
docker network inspect shared-network >/dev/null 2>&1 || docker network create shared-network

docker compose build
docker compose up -d mysql

until docker inspect -f '{{.State.Health.Status}}' absensi-mysql 2>/dev/null | grep -q healthy; do
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

1. **Networks → Tunnels** → pilih tunnel yang sudah dipakai task-management (yang statusnya aktif).
2. Tab **Public Hostname → Add a public hostname**:
   - **Subdomain**: `absensi`
   - **Domain**: `deevatech.my.id`
   - **Service → Type**: `HTTP`
   - **Service → URL**: `absensi-nginx:80`
3. **Save** — selesai. Tidak perlu isi apa pun di bagian **Access** pada form ini.

🔴 Supaya **tidak** memicu halaman login Cloudflare Access: jangan bikin **Access Application** baru untuk `absensi.deevatech.my.id` di menu **Access → Applications**. Tab "Public Hostname" pada Tunnel itu murni routing HTTP, beda fitur dari Access. Kalau sebelumnya sudah ada Access Application dengan domain wildcard (`*.deevatech.my.id`), hostname baru ini akan otomatis ikut ter-proteksi login — cek dulu di **Access → Applications**, dan kalau ada, tambahkan exception/bypass untuk `absensi.deevatech.my.id` atau pastikan tidak ada wildcard yang mencakupnya.

---

## 4. Checklist verifikasi

- [ ] `https://absensi.deevatech.my.id` terbuka langsung (tanpa halaman login Cloudflare Access), SSL valid
- [ ] Login employee/admin & check-in/check-out (geolocation) berfungsi
- [ ] `docker compose ps` (di `/opt/apps/absensi`) → semua `Up`/`healthy`
- [ ] `docker network inspect shared-network` → menunjukkan container cloudflared **dan** `absensi-nginx` sama-sama terhubung
- [ ] `https://task.deevatech.my.id` tetap normal (task-management tidak terganggu)
- [ ] Dari luar, `http://<ip-vps>:8082` **harus gagal connect** (bukti nginx absensi cuma bind ke `127.0.0.1`)

---

## 5. Update kode saat deploy berikutnya

```bash
cd /opt/apps/absensi
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
