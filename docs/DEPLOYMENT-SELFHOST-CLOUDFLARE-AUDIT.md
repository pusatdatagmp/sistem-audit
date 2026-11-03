# DEPLOYMENT: Sistem Audit GMP — Docker + Cloudflare Tunnel (shared dengan task-management)

Target: **https://audit.deevatech.my.id**

> VPS ini sudah menjalankan stack `task-management` (dengan **cloudflared** —
> tunnel aktif), `absensi`, dan `bms`. Sistem Audit jalan sebagai stack Docker
> Compose **terpisah** di `/opt/apps/audit`, dan **memakai tunnel `cloudflared`
> yang sudah ada** — tidak bikin tunnel/container `cloudflared` baru, tidak perlu
> nginx host maupun certbot (SSL ditangani Cloudflare).

Sistem Audit **tidak memakai queue maupun scheduler** (tidak ada `app/Jobs`,
tidak ada scheduled task di `routes/console.php`, notifikasi WhatsApp Fonnte
dikirim langsung/sinkron), jadi stack-nya 3 container:

| Container | Fungsi |
|---|---|
| `audit-app` | PHP 8.3-FPM (Laravel), jalan sebagai `www-data` dengan uid/gid = user VPS |
| `audit-nginx` | Web server; join `shared-network` (target tunnel) + bind `127.0.0.1:8084` untuk cek lokal |
| `audit-mysql` | MySQL 8.0, data di volume `audit-mysql-data`, tidak diekspos |

> Port lokal **8084** — 8083 sudah dipakai BMS. Bisa diubah lewat `APP_PORT` di `.env`.

**Cara nyambung:** `audit-nginx` ikut network eksternal `shared-network` yang juga
sudah di-join-kan ke container `cloudflared`. Cloudflare Tunnel di-route ke
`audit-nginx:80` lewat network itu — tanpa expose port apa pun ke publik.

---

## Ringkasan alur deploy pertama

| # | Langkah | Di mana |
|---|---|---|
| 1 | Cek prasyarat (Docker, akses GitHub, cloudflared di `shared-network`) | VPS |
| 2 | Clone repo ke `/opt/apps/audit` | VPS |
| 3 | Buat & isi `.env` (UID/GID, password DB, `APP_KEY`, Fonnte) | VPS |
| 4 | Jalankan `./deploy.sh --first` | VPS |
| 5 | Tambah Public Hostname `audit` di tunnel | Cloudflare dashboard |
| 6 | Buat akun admin pertama | VPS |
| 7 | Checklist verifikasi | Browser + VPS |

Semua perintah di bawah dijalankan sebagai **user biasa VPS** (bukan root), kecuali yang memakai `sudo`.

---

## 1. Prasyarat (sekali saja)

### 1a. Docker & akses GitHub

```bash
docker --version && docker compose version   # keduanya harus keluar versi
groups | grep -q docker && echo "OK: user ada di grup docker"
ssh -T git@github.com                         # harus: "Hi ...! You've successfully authenticated"
```

- Kalau `docker` minta `sudo`: `sudo usermod -aG docker $USER`, lalu **logout & login ulang**.
- Kalau `ssh -T` ditolak: tambahkan SSH key VPS (`cat ~/.ssh/id_ed25519.pub`) sebagai **Deploy key** (read-only) di repo GitHub sistem audit → *Settings → Deploy keys*. Satu SSH key hanya bisa jadi deploy key di **satu** repo — kalau key yang sama sudah dipakai repo BMS, buat key baru (`ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_audit`) dan daftarkan host alias di `~/.ssh/config`:

  ```
  Host github-audit
      HostName github.com
      IdentityFile ~/.ssh/id_ed25519_audit
  ```

  lalu clone dengan `git@github-audit:<owner>/<repo>.git`.

### 1b. Pastikan cloudflared terhubung ke shared-network

Kalau absensi/BMS sudah jalan via tunnel, langkah ini biasanya **sudah beres**. Cek:

```bash
docker network inspect shared-network --format '{{range .Containers}}{{.Name}}{{"\n"}}{{end}}'
```

Kalau container `cloudflared` belum ada di daftar:

```bash
docker ps --format '{{.Names}}\t{{.Image}}' | grep -i cloudflared   # catat namanya
docker network inspect shared-network >/dev/null 2>&1 || docker network create shared-network
docker network connect shared-network <NAMA_CONTAINER_CLOUDFLARED>
```

🔴 Catatan durabilitas: kalau container `cloudflared` di-*recreate* (`docker compose down && up` di stack task-management), koneksi manual ini hilang dan perlu diulang — audit, BMS, **dan** absensi akan sama-sama down (error 502). Supaya permanen, tambahkan `shared-network` (`external: true`) ke service `cloudflared` di `docker-compose.yml` task-management. `deploy.sh` menampilkan peringatan kalau cloudflared tidak terdeteksi di network ini.

---

## 2. Clone repository

```bash
sudo mkdir -p /opt/apps/audit
sudo chown -R $USER:$USER /opt/apps/audit
cd /opt/apps/audit
git clone <url-repo-sistem-audit-gmp> .   # titik = clone ke folder ini
chmod +x deploy.sh
```

> `git clone ... .` hanya bisa ke folder **kosong**. Kalau sebelumnya sudah pernah deploy versi lama di folder ini, **jangan dikosongkan** — cukup `git pull` lalu lanjut ke langkah 3 (lihat bagian [Migrasi dari setup lama](#migrasi-dari-setup-lama)).

> 🔴 **Kalau terpaksa clone/deploy sebagai `root`:** semua file jadi milik `root:root`, sedangkan PHP di container jalan sebagai uid `HOST_UID` (default 1000) → Laravel tidak bisa menulis `storage/` → **HTTP 500 tanpa file log**. Perbaiki:
>
> ```bash
> chown -R 1000:1000 /opt/apps/audit
> git config --global --add safe.directory /opt/apps/audit
> ```

Cek hasil clone — file berikut harus ada:

```bash
ls deploy.sh docker-compose.yml Dockerfile .env.production.example docker/nginx/default.conf docker/php/php.ini
```

---

## 3. Buat & isi `.env`

### 3a. Salin template

```bash
cd /opt/apps/audit
cp .env.production.example .env
```

### 3b. Isi nilai otomatis (UID/GID, password DB, APP_KEY)

Jalankan blok ini **sekali** (copy-paste utuh):

```bash
cd /opt/apps/audit
if [ "$(id -u)" = "0" ]; then UID_VAL=1000; GID_VAL=1000; else UID_VAL=$(id -u); GID_VAL=$(id -g); fi
sed -i "s|^HOST_UID=.*|HOST_UID=$UID_VAL|" .env
sed -i "s|^HOST_GID=.*|HOST_GID=$GID_VAL|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$(openssl rand -hex 24)|" .env
sed -i "s|^DB_ROOT_PASSWORD=.*|DB_ROOT_PASSWORD=$(openssl rand -hex 24)|" .env
sed -i "s|^APP_KEY=.*|APP_KEY=base64:$(openssl rand -base64 32)|" .env
```

### 3c. Isi token Fonnte (notifikasi WhatsApp)

```bash
nano .env   # isi FONNTE_TOKEN dan cek FONNTE_ADMIN_NUMBER
```

`FONNTE_TOKEN` didapat dari dashboard [fonnte.com](https://fonnte.com) setelah device WhatsApp di-scan QR. Tanpa token ini, notifikasi hanya ditulis ke log sebagai warning — tidak membatalkan pembuatan tiket/equipment request.

### 3d. Periksa hasilnya

```bash
grep -E '^(APP_ENV|APP_DEBUG|APP_URL|APP_KEY|APP_PORT|HOST_UID|HOST_GID|DB_HOST|DB_DATABASE|DB_USERNAME|DB_PASSWORD|DB_ROOT_PASSWORD|SESSION_DOMAIN|SESSION_SECURE_COOKIE|QUEUE_CONNECTION)=' .env
```

Harus terlihat seperti ini:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://audit.deevatech.my.id
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=
APP_PORT=8084
HOST_UID=1000                 # = hasil `id -u`
HOST_GID=1000                 # = hasil `id -g`
DB_HOST=mysql                 # nama service di docker-compose, JANGAN 127.0.0.1
DB_DATABASE=audit_gmp
DB_USERNAME=audit_user
DB_PASSWORD=<acak>
DB_ROOT_PASSWORD=<acak>
SESSION_DOMAIN=audit.deevatech.my.id
SESSION_SECURE_COOKIE=true
QUEUE_CONNECTION=sync
```

### 3e. Amankan `.env`

```bash
chmod 600 .env
```

Simpan `APP_KEY` dan `DB_ROOT_PASSWORD` di password manager. **`APP_KEY` jangan pernah diganti** setelah aplikasi dipakai.

🔴 `APP_KEY` diisi sekarang karena `.env` dimuat ke container via `env_file`. Kalau kosong saat container dibuat, container membawa `APP_KEY=` kosong → *No application encryption key has been specified*.

🔴 `DB_PASSWORD`/`DB_ROOT_PASSWORD` hanya berlaku saat volume MySQL **pertama kali** dibuat. Mengganti nilainya setelah itu **tidak** mengubah password di MySQL.

🔴 `HOST_UID`/`HOST_GID`: `www-data` di image di-set ke uid/gid user VPS, jadi file `storage/`, `bootstrap/cache`, `vendor/` dimiliki user Anda sendiri — **tidak perlu** `sudo chown www-data`.

🔴 `QUEUE_CONNECTION=sync` karena tidak ada container worker — `database` akan menumpuk row di tabel `jobs` tanpa pernah diproses.

---

## 4. Build & jalankan (deploy pertama)

```bash
cd /opt/apps/audit
./deploy.sh --first
```

Yang dilakukan script:

1. Pastikan `shared-network` ada + cek cloudflared terhubung
2. `docker compose build app`
3. Start `mysql`, tunggu sampai `healthy`, lalu start `app` + `nginx`
4. `composer install --no-dev --optimize-autoloader`
5. `npm ci && npm run build` di container `node:20` sementara (jalan sebagai user Anda)
6. `key:generate` (hanya jika `APP_KEY` kosong) + `storage:link`
7. `migrate --force`
8. Seed **hanya** `RoleSeeder` (+ `PermissionSeeder`) — data dummy tidak ikut (`DatabaseSeeder` menolak jalan di production)
9. `optimize` (cache config/route/view/event)
10. Cek `http://127.0.0.1:8084/up`

Script berhenti di langkah pertama yang gagal (`set -e`). Perbaiki penyebabnya, lalu jalankan ulang `./deploy.sh --first` — aman diulang.

### Cek lokal di VPS

```bash
docker compose ps                      # 3 container Up; audit-mysql (healthy)
curl -I http://127.0.0.1:8084/up       # harus HTTP/1.1 200 OK
docker compose exec app php artisan about --only=environment   # Environment: production, Debug Mode: OFF
```

---

## 5. Cloudflare Zero Trust Dashboard — tambah route, TANPA halaman login

1. **Networks → Tunnels** → pilih tunnel yang dipakai task-management (status aktif).
2. Tab **Public Hostname → Add a public hostname**:
   - **Subdomain**: `audit`
   - **Domain**: `deevatech.my.id`
   - **Service → Type**: `HTTP`
   - **Service → URL**: `audit-nginx:80`
3. **Save**. DNS record `audit` dibuat otomatis oleh Cloudflare.

🔴 Jangan bikin **Access Application** untuk `audit.deevatech.my.id`. Kalau ada Access Application wildcard `*.deevatech.my.id`, tambahkan bypass untuk hostname ini.

---

## 6. Buat akun admin pertama

Ganti email & password lalu jalankan (satu baris):

```bash
cd /opt/apps/audit
docker compose exec -e HOME=/tmp app php artisan tinker --execute='$u = App\Models\User::firstOrCreate(["email" => "admin@deevatech.my.id"], ["name" => "Administrator", "password" => "PASSWORD_KUAT_ANDA", "role_id" => App\Models\Role::where("code", App\Models\Role::CODE_ADMIN)->value("id")]); echo "OK: " . $u->email . " role_id=" . $u->role_id . PHP_EOL;'
```

> Password tidak perlu `bcrypt()` — model `User` sudah memakai cast `hashed`.

Harus keluar `OK: admin@deevatech.my.id role_id=<angka>`. Kalau `role_id=` kosong → seeder role belum jalan: `docker compose exec app php artisan db:seed --class=RoleSeeder --force`, lalu set role-nya:

```bash
docker compose exec -e HOME=/tmp app php artisan tinker --execute='App\Models\User::where("email", "admin@deevatech.my.id")->update(["role_id" => App\Models\Role::where("code", App\Models\Role::CODE_ADMIN)->value("id")]); echo "OK" . PHP_EOL;'
```

> `-e HOME=/tmp` wajib: tinker menulis config ke `$HOME/.config/psysh`, sedangkan home `www-data` tidak bisa ditulis.

Login di https://audit.deevatech.my.id, lalu atur nama aplikasi/logo di **System Settings** dan input data master lewat aplikasi.

---

## 7. Checklist verifikasi

- [ ] `https://audit.deevatech.my.id` terbuka langsung (tanpa halaman login Cloudflare Access), SSL valid
- [ ] Tidak ada error *mixed content* di console browser, CSS/JS tampil normal
- [ ] Login admin berhasil, tidak ter-logout / error 419
- [ ] Upload foto tiket (≤ 4 MB) & logo System Settings tersimpan dan tampil
- [ ] Buat tiket → notifikasi WhatsApp terkirim (atau warning di `storage/logs/` kalau token belum diisi)
- [ ] `docker network inspect shared-network` → cloudflared, `absensi-nginx`, `bms-nginx`, **dan** `audit-nginx` terhubung
- [ ] `https://task.deevatech.my.id`, `https://absensi.deevatech.my.id`, `https://bms.deevatech.my.id` tetap normal
- [ ] Dari luar, `http://<ip-vps>:8084` **harus gagal connect**

---

## 8. Update kode saat deploy berikutnya

```bash
cd /opt/apps/audit
./deploy.sh          # TANPA --first
```

Script menjalankan `git pull --ff-only`, build ulang image, composer, build asset, migrate, cache ulang, restart `app`. **Tidak** menjalankan seeder.

> `git pull --ff-only` gagal kalau ada file yang diubah langsung di server. Jangan edit kode di VPS — ubah di lokal, push, lalu deploy.

Jika ada permission baru di `Permission::CATALOG`:

```bash
docker compose exec app php artisan db:seed --class=RoleSeeder --force
```

> `RoleSeeder` men-*sync* ulang permission role bawaan (admin = semua permission, reporter = kosong, driver = portal driver).

Jika mengubah `.env` (selain password DB), container harus **dibuat ulang**:

```bash
docker compose up -d --force-recreate app
docker compose exec app php artisan optimize
```

---

## 9. Backup database

```bash
cd /opt/apps/audit
source <(grep -E '^DB_(DATABASE|ROOT_PASSWORD)=' .env)
docker compose exec -T mysql mysqldump -uroot -p"$DB_ROOT_PASSWORD" --single-transaction "$DB_DATABASE" | gzip > ~/audit_$(date +%F).sql.gz
```

File upload (foto tiket, logo) ada di `storage/app/public` — ikut di-backup:

```bash
tar czf ~/audit_storage_$(date +%F).tar.gz -C /opt/apps/audit storage/app
```

Restore:

```bash
cd /opt/apps/audit
source <(grep -E '^DB_(DATABASE|ROOT_PASSWORD)=' .env)
gunzip -c ~/audit_YYYY-MM-DD.sql.gz | docker compose exec -T mysql mysql -uroot -p"$DB_ROOT_PASSWORD" "$DB_DATABASE"
```

Salin backup berkala ke luar VPS (`scp`/`rsync`).

---

## Migrasi dari setup lama

Kalau sebelumnya sudah deploy dengan setup lama (tanpa `deploy.sh`, `www-data` uid 82):

```bash
cd /opt/apps/audit
git pull
# tambahkan ke .env yang sudah ada (JANGAN timpa dengan template — APP_KEY & password DB harus tetap):
grep -q '^HOST_UID=' .env || echo "HOST_UID=$(id -u)" >> .env
grep -q '^HOST_GID=' .env || echo "HOST_GID=$(id -g)" >> .env
grep -q '^APP_PORT=' .env || echo "APP_PORT=8084" >> .env
grep -q '^SESSION_DOMAIN=audit' .env || sed -i 's|^SESSION_DOMAIN=.*|SESSION_DOMAIN=audit.deevatech.my.id|' .env
grep -q '^SESSION_SECURE_COOKIE=' .env || echo "SESSION_SECURE_COOKIE=true" >> .env
sudo chown -R $USER:$USER .
./deploy.sh
```

Volume `audit-mysql-data` tetap sama, jadi data tidak hilang. Port lokal pindah dari 8083 ke 8084 (bentrok dengan BMS) — tidak berpengaruh ke Cloudflare karena tunnel mengarah ke `audit-nginx:80`.

---

## Perintah yang sering dipakai

Semua dijalankan dari `/opt/apps/audit`:

```bash
docker compose ps                         # status container
docker compose logs -f app nginx          # log web
tail -f storage/logs/laravel-*.log        # log Laravel
docker compose exec app php artisan ...   # jalankan artisan
docker compose down                       # matikan (data MySQL aman di volume)
```

> **Jangan** jalankan `docker compose down -v` — `-v` menghapus volume database.
>
> **Jangan** jalankan `php artisan migrate:fresh` / `db:wipe` / `db:seed` (tanpa `--class`) di produksi.

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `File .env belum ada` saat `./deploy.sh` | `cp .env.production.example .env` lalu isi (langkah 3) |
| `DB_PASSWORD di .env masih default` | Jalankan blok langkah 3b |
| `permission denied while trying to connect to the Docker daemon socket` | `sudo usermod -aG docker $USER`, logout & login ulang |
| `Permission denied (publickey)` saat clone / `git pull` | SSH key VPS belum jadi Deploy key — lihat langkah 1a |
| `./deploy.sh: Permission denied` | `chmod +x deploy.sh` |
| `bash\r: No such file or directory` | File ter-checkout dengan CRLF: `sed -i 's/\r$//' deploy.sh` |
| `port is already allocated` (8084) | Port dipakai stack lain — ganti `APP_PORT` di `.env`, lalu `docker compose up -d nginx` |
| MySQL tidak healthy | `docker compose logs mysql`. Kalau password salah karena volume lama dan **belum ada data penting**: `docker compose down && docker volume rm audit_audit-mysql-data` lalu deploy ulang |
| `SQLSTATE[HY000] [1045] Access denied` | `DB_PASSWORD` diganti setelah volume dibuat — kembalikan nilai lama |
| `SQLSTATE[HY000] [2002] Connection refused` | `DB_HOST` bukan `mysql` / MySQL belum siap |
| `No application encryption key has been specified` | Isi `APP_KEY` (3b), `docker compose up -d --force-recreate app && docker compose exec app php artisan optimize` |
| Cloudflare **502 / Bad gateway** | cloudflared tidak menjangkau `audit-nginx` — cek langkah 1b dan `docker compose ps nginx` |
| Cloudflare **1033** | Tunnel task-management mati — cek container cloudflared |
| Muncul halaman login Cloudflare | Ada Access Application wildcard — lihat langkah 5 |
| `network shared-network declared as external, but could not be found` | `docker network create shared-network`, lalu langkah 1b |
| HTTP 500 di `/up` dan `storage/logs/` kosong | Folder milik `root` — `sudo chown -R $(id -u):$(id -g) .` |
| `Permission denied` di `storage/` / `bootstrap/cache` | `HOST_UID/HOST_GID` salah. Perbaiki → `docker compose build app && docker compose up -d --force-recreate app` |
| Upload foto gagal / error 413 | Batas: nginx `client_max_body_size 20M`, PHP `docker/php/php.ini`, validasi app 4 MB |
| CSS/JS tidak muncul / mixed content | Pastikan `APP_URL=https://audit.deevatech.my.id`, lalu `docker compose up -d --force-recreate app && docker compose exec app php artisan optimize` |
| `/build/manifest.json` not found | Build Vite gagal — ulangi `./deploy.sh`, perhatikan tahap "Build asset frontend" |
| Perubahan `.env` tidak berefek | `docker compose up -d --force-recreate app && docker compose exec app php artisan optimize` |
| Login berhasil tapi langsung ter-logout / error 419 | `SESSION_DOMAIN=audit.deevatech.my.id`, `SESSION_SECURE_COOKIE=true`, akses lewat `https://` bukan `http://127.0.0.1:8084` |
