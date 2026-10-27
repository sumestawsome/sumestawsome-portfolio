# ATURAN BAKU PENGERJAAN & WORKFLOW SISTEM (SUMESTAWSOME.XYZ)

Dokumen ini merupakan Standard Operating Procedure (SOP) mutlak. Setiap kali Antigravity membaca instruksi pengguna, seluruh aturan di bawah ini WAJIB dijalankan tanpa kompromi.

---

## 1. INTEGRASI CODEBASE MEMORY MCP
1. **Instalasi Runtime MCP:**
   - Linux/macOS:
     `curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash`
   - Windows (PowerShell Run as Administrator):
     `irm https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1 | iex`
2. **Pengindeksan Kode:** 
   - Setiap kali terjadi penambahan fitur besar, perubahan arsitektur rute, atau refaktor komponen antarmuka, jalankan query: `"Index this project"`.
   - Gunakan graph memory MCP untuk membaca dependensi antar-komponen sebelum melakukan modifikasi berkas.

---

## 2. WORKFLOW EKSEKUSI & GIT (WAJIB TIAP SELESAI TUGAS)
Setiap kali menyelesaikan tugas, perbaikan bug, atau penambahan fitur baru:
1. **Verifikasi Build:** Jalankan `npm run build` (atau `pnpm build`) untuk memastikan tidak ada error TypeScript, linting, atau kegagalan kompilasi bundle.
2. **Git Staging:** Jalankan `git add .` untuk seluruh perubahan yang relevan.
3. **Commit Terstruktur:** Terapkan commit message konvensional yang bersih:
   - `ui:` perubahan styling, layout, tipografi, atau komponen visual
   - `feat:` penambahan fitur fungsional atau halaman baru
   - `fix:` perbaikan bug, logika state, atau kalkulasi
   - `chore:` pembaruan dependensi, konfigurasi build, atau dokumentasi
4. **Push Siap Pakai:** Eksekusi `git push origin main` setelah commit selesai dibuat.
5. **Anti-Hang Runner:** Jangan biarkan terminal atau server runner menggantung tanpa sinyal keluar (exit code 0).

---

## 3. DESIGN SYSTEM & GEOMETRI UI (STRICT TOKENS)
1. **Palet Warna Primer (Ungu Semesta):**
   - Warna utama sistem didefinisikan di `tailwind.config.js` dengan token `semesta` (`#5b21b6`).
   - Gunakan selalu class semantik: `bg-semesta`, `text-semesta`, `border-semesta`, `hover:bg-semesta/90`.
   - Dilarang keras menulis kode warna heksa acak (seperti `bg-[#4F46E5]`, `bg-[#5b21b6]`, atau inline style heksa).
2. **Tipografi Baku:**
   - Gunakan keluarga font utama `"Inter"` (`font-sans`) dan font monospace `"DM Mono"` (`font-mono`) sesuai konfigurasi Tailwind.
3. **Geometri Tegas (Zero Rounded):**
   - Seluruh elemen antarmuka (kartu, tombol, formulir input, modal dialog, gambar) WAJIB bersudut tajam (`rounded-none` / `0px`).
   - Dilarang menambahkan utility `rounded`, `rounded-md`, `rounded-lg`, atau `rounded-full` kecuali untuk penanda avatar lingkaran khusus yang diizinkan secara eksplisit.
4. **Elevasi Flat & Border Kontras (Zero Shadow):**
   - Hindari pemakaian class shadow blur berlebih (`shadow-lg`, `shadow-xl`).
   - Gunakan pemisah bidang berupa garis tepi tegas (`border border-zinc-200` atau `border-zinc-800` pada mode gelap).
5. **Animasi Kaskade:**
   - Manfaatkan animasi deklaratif yang ada di tailwind.config seperti `animate-cascade-icon`, `animate-cascade-title`, dan `animate-cascade-price` untuk transisi elemen masuk.

---

## 4. STANDAR PENGEMBANGAN BLOG & SEO
1. **Metadata Dinamis:** Setiap rute artikel blog wajib mengimplementasikan metadata lengkap (`title`, `description`, `canonical`, OpenGraph `1200x630`) yang ditarik langsung dari field dokumen Firestore.
2. **Performa Rendering:** Gunakan SSG/ISR (`generateStaticParams`) untuk rute dinamis artikel agar halaman disajikan sebagai HTML statis siap rayap bagi mesin pencari.
3. **Penyajian Gambar:** Gunakan komponen gambar teroptimasi dengan rasio dimensi yang jelas dan atribut `alt` deskriptif.

---

## 5. COPYWRITING & TONE OF VOICE RULES (@no-berat-berat)
1. **Dilarang Menggunakan Tanda Pisah Em-Dash (`—`):** Jangan gunakan tanda pisah panjang untuk menyisipkan anak kalimat. Gunakan tanda koma biasa, titik, atau pecah menjadi dua kalimat terpisah agar alurnya santai dan mengalir.
2. **Anti-AI Slop & Jargon Kaku:** Hindari kata-kata klise robotik seperti "di era digital yang berkembang pesat", "optimalisasi menyeluruh", "mitigasi", atau "transformasi terintegrasi". Gunakan kata kerja aktif dan konkret yang umum dipakai sehari-hari.
3. **Persuasif, Ringan, dan Percaya Diri:** Teks harus menjual kemampuan teknis tanpa terkesan sombong atau berputar-putar. Sampaikan masalah klien, tawarkan solusinya langsung, dan jelaskan hasilnya dengan lugas.
4. **Struktur Kalimat Pendek:** Buat kalimat yang ringkas agar enak dibaca sekilas (skimmable) di layar HP maupun laptop.

---

## 6. MANDAT OPERASIONAL ASISTEN
- Antigravity wajib memeriksa `tailwind.config.js` sebelum menambahkan class baru.
- Dilarang menghapus atau mengubah konfigurasi default tanpa konfirmasi.
- Selalu patuhi aturan ini pada setiap prompt berikutnya tanpa perlu diingatkan kembali.
