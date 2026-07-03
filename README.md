# RJF STUDIO Website

Static site (HTML/CSS/JS), siap deploy ke GitHub Pages.

## Setup Subscriber Counter (aman, key gak pernah masuk browser)

1. Buka repo di GitHub → **Settings → Secrets and variables → Actions**.
2. Tab **Secrets** → New repository secret:
   - Name: `YT_API_KEY`
   - Value: API key YouTube Data API v3 kamu (dari Google Cloud Console)
3. Tab **Variables** → New repository variable:
   - Name: `YT_CHANNEL_HANDLE`
   - Value: handle channel kamu, contoh `@rjfstudio`
4. Buka tab **Actions** → workflow **"Update YouTube Subscriber Count"** → klik **Run workflow** sekali secara manual buat generate `subscribers.json` pertama kali.
5. Selesai. Workflow ini otomatis jalan tiap 6 jam dan commit `subscribers.json` yang baru. Situs bakal baca file itu tiap kali dibuka.

> Kenapa ini aman: API key cuma dipakai di dalam runner GitHub Actions (server-side), bukan di browser pengunjung. Yang publik cuma angka hasilnya, bukan key-nya.

## Setup GitHub Pages

1. **Settings → Pages** → Source: pilih branch `main` (atau branch default kamu), folder `/ (root)`.
2. Save. Situs bakal live di `https://<username>.github.io/<nama-repo>/`.

## Override Live (opsional, ada tradeoff)

Kalau mau angka subscriber update real-time (bukan tiap 6 jam), kamu bisa isi API key + handle pribadi lewat tombol **Settings** (ikon gear) di website. Ini live fetch langsung dari browser pengunjung.

**WAJIB** dibatasi dulu di Google Cloud Console:
- **API restrictions**: cuma izinkan "YouTube Data API v3".
- **Website restrictions (HTTP referrers)**: cuma izinkan domain GitHub Pages kamu, misal `https://<username>.github.io/*`.

Tanpa restriction ini, key kamu bisa dipakai orang lain dan kuota gratis 10.000 unit/hari kamu abis duluan sebelum jam makan siang.
