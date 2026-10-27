import fs from 'node:fs';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

/**
 * Skrip Mandiri (Single Insert/Update):
 * Khusus untuk menambahkan/memperbarui SATU artikel blog saja:
 * Slug: cara-mencari-tanggal-lahir-dari-hari-otonan-bali
 * 
 * Sesuai aturan ketat:
 * 1. Tidak menyentuh atau menjalankan seed-blog.js
 * 2. Tidak mengubah dokumen artikel blog lainnya di Firestore
 * 3. Bersih dari artifak sitasi ([cite: ...]) dan tanpa em-dash (—)
 */

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Error: Kredensial Firebase tidak ditemukan di .env.local');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const args = process.argv.slice(2);
const emailArg = args.find((a) => a.startsWith('--email='))?.split('=')[1] || process.env.ADMIN_EMAIL;
const passArg = args.find((a) => a.startsWith('--password='))?.split('=')[1] || process.env.ADMIN_PASSWORD;

const targetSlug = 'cara-mencari-tanggal-lahir-dari-hari-otonan-bali';

const blogPostData = {
  title: 'Cara Mencari Tanggal Lahir dari Hari Otonan Bali (Bedah Logika dan Algoritma)',
  slug: targetSlug,
  category: 'Tutorial',
  tags: ['Algoritma', 'Kalender Bali', 'Bahasa C', 'Otonan', 'Web Development'],
  excerpt:
    'Banyak orang tua di Bali hafal hari otonannya tapi bingung tanggal lahir di KTP. Yuk bedah bagaimana kodingan lengkap bahasa C dan siklus 210 hari Pawukon mencari tanggal lahir akurat.',
  readingTime: 6,
  status: 'published',
  isFeatured: false,
  coverImage: {
    url: 'https://cdn.sumestawsome.xyz/uploads/cover-otonan-placeholder.webp',
    alt: 'Cara Mencari Tanggal Lahir dari Hari Otonan Bali (Bedah Logika dan Algoritma)',
    width: 1200,
    height: 630,
  },
  author: {
    name: 'Admin Sumesta',
    avatar: 'https://ui-avatars.com/api/?name=Admin+Sumesta&background=0f172a&color=fff&bold=true',
    bio: 'Full-stack developer & tech enthusiast.',
    url: 'https://sumestawsome.xyz',
  },
  authorRole: 'Full-stack developer & tech enthusiast.',
  authorAvatar: 'https://ui-avatars.com/api/?name=Admin+Sumesta&background=0f172a&color=fff&bold=true',
  seo: {
    metaTitle: 'Cara Mencari Tanggal Lahir dari Hari Otonan Bali (Bedah Logika dan Algoritma)',
    metaDescription:
      'Banyak orang tua di Bali hafal hari otonannya tapi bingung tanggal lahir di KTP. Yuk bedah bagaimana kodingan lengkap bahasa C dan siklus 210 hari Pawukon mencari tanggal lahir akurat.',
    keywords: ['Algoritma', 'Kalender Bali', 'Bahasa C', 'Otonan', 'Web Development'],
    canonicalUrl: `https://sumestawsome.xyz/blog/${targetSlug}`,
    ogType: 'article',
    noIndex: false,
  },
  stats: {
    views: 0,
    likes: 0,
  },
  content: `Pernah nggak kamu ngobrol santai bareng kakek, nenek, atau orang tua di Bali, terus pas ditanya tanggal lahir Masehi di KTP, mereka malah bingung?

Kondisi ini wajar banget terjadi. Orang tua zaman dulu jarang mencatat tanggal Masehi seperti 17 Agustus atau 10 November. Tapi uniknya, kalau ditanya hari otonan, mereka hafal di luar kepala. Misalnya, mereka ingat lahir pas hari *Budha Kliwon Dungulan* pas hari raya Galungan, atau *Saniscara Kliwon Krulut* pas hari Tumpek Krulut.

Berangkat dari masalah nyata itu, kita bisa bikin program komputer sederhana buat menebak kapan kira-kira tanggal lahir Masehi mereka.

Kalau kamu mau langsung coba hitung tanpa ribet baca kodingan, langsung aja pakai alatnya di [Web Tool OtonanE](https://sumestawsome.xyz/tools/cari-tanggal-lahir-otonan). Tapi kalau kamu penasaran gimana logika matematika dan kodingan C aslinya bekerja, yuk kita bedah bareng-bareng!

---

## Rahasia Putaran Kalender Bali

Sistem penanggalan Pawukon Bali itu cara kerjanya mirip gerigi jam dinding yang berputar barengan setiap hari:

* **Saptawara (Putaran 7 Hari):** Sama persis dengan nama hari biasa, mulai dari Redite (Minggu), Soma (Senin), Anggara (Selasa), Budha (Rabu), Wraspati (Kamis), Sukra (Jumat), sampai Saniscara (Sabtu).
* **Pancawara (Putaran 5 Hari Pasaran):** Pasaran khas yang isinya Umanis, Pahing, Pon, Wage, dan Kliwon.
* **Wuku (Putaran 30 Pekan):** Ada 30 nama wuku dalam satu putaran penuh, dimulai dari Wuku Sinta dan diakhiri Wuku Watugunung. Masing-masing wuku umurnya 7 hari.

Kenapa otonan selalu datang tiap 210 hari sekali?

Karena satu siklus wuku memakan waktu 30 wuku x 7 hari = 210 hari. Angka 210 ini kalau dibagi 5 (pasaran Pancawara) hasilnya pas 42 putaran tanpa sisa. Makanya, setiap 210 hari sekali, kombinasi Saptawara, Pancawara, dan Wuku bakal ketemu lagi di titik yang persis sama.

---

## Kodingan Lengkap Bahasa C (alpro.c)

Ini kode program lengkapnya persis seperti tugas praktikum Algoritma dan Pemrograman kemarin, lengkap dengan fungsi manipulasi tanggal manual, pengecekan kabisat, perulangan siklus, sampai pencarian rentang tahun lahir:

\`\`\`c
#include <stdio.h>

// 1. Fungsi buat ngecek apakah sebuah tahun itu kabisat atau bukan
// Tahun kabisat artinya bulan Februari punya 29 hari.
int isLeapYear(int year) {
    if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
        return 1; // Kabisat
    }
    return 0; // Bukan kabisat
}

// 2. Fungsi buat memajukan tanggal kalender Masehi hari demi hari
void addDays(int *day, int *month, int *year, int offset) {
    // Daftar jumlah hari tiap bulan (indeks 0 sengaja dikosongkan biar ramah bulan 1-12)
    int md[13] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

    for (int i = 0; i < offset; i++) {
        (*day)++;

        // Kalau masuk bulan Februari dan tahun kabisat, ubah jumlah hari jadi 29
        if (*month == 2 && isLeapYear(*year)) {
            md[2] = 29;
        } else {
            md[2] = 28;
        }

        // Kalau tanggal nembus batas akhir bulan, kembalikan ke tanggal 1 dan bulannya maju
        if (*day > md[*month]) {
            *day = 1;
            (*month)++;

            // Kalau bulannya lewat dari Desember (12), balik ke Januari dan tahunnya maju
            if (*month > 12) {
                *month = 1;
                (*year)++;
            }
        }
    }
}

// 3. Fungsi buat memundurkan tanggal kalender Masehi (jalan mundur ke masa lalu)
void subtractDays(int *day, int *month, int *year, int offset) {
    int md[13] = {0, 31, 28, 31, 30, 31, 30, 31, 30, 31, 30, 31};

    for (int i = 0; i < offset; i++) {
        (*day)--;

        if (*month == 2 && isLeapYear(*year)) {
            md[2] = 29;
        } else {
            md[2] = 28;
        }

        // Kalau tanggal mundur nembus sebelum tanggal 1, bulannya mundur satu langkah
        if (*day < 1) {
            (*month)--;

            // Kalau bulannya sebelum Januari, balik ke bulan Desember tahun sebelumnya
            if (*month < 1) {
                *month = 12;
                (*year)--;
            }

            // Set hari ke tanggal terakhir dari bulan sebelumnya yang baru dimasuki
            if (*month == 2 && isLeapYear(*year)) {
                *day = 29;
            } else {
                *day = md[*month];
            }
        }
    }
}

int main() {
    // Bikin kode label singkat buat pola P1-P5, S1-S7, dan W1-W30
    char P[5][3] = {"P1", "P2", "P3", "P4", "P5"};
    char S[7][3] = {"S1", "S2", "S3", "S4", "S5", "S6", "S7"};
    char W[30][4];
    for (int i = 0; i < 30; i++) {
        sprintf(W[i], "W%d", i + 1);
    }

    // Posisi patokan awal kita: 12 Maret 2025 (Pancawara ke-3, Saptawara ke-4, Wuku ke-5)
    // Karena bahasa C memakai indeks mulai dari 0, angkanya kita kurangi 1
    int startP = 2, startS = 3, startW = 4;
    printf("Posisi dasar di-set ke: %s %s %s\n", P[startP], S[startS], W[startW]);

    // Daftar nama lengkap kalender Bali
    char *pancawara[5] = {"Umanis", "Pahing", "Pon", "Wage", "Kliwon"};
    char *saptawara[7] = {"Redite", "Soma", "Anggara", "Budha", "Wraspati", "Sukra", "Saniscara"};
    char *wuku[30] = {
        "Sinta", "Landep", "Ukir", "Kulantir", "Tolu",
        "Gumbreg", "Wariga", "Warigadean", "Julungwangi", "Sungsang",
        "Dungulan", "Kuningan", "Langkir", "Medangsia", "Pujut",
        "Pahang", "Krulut", "Mrakih", "Tambir", "Madangkungan",
        "Matal", "Uye", "Manail", "Perangbakat", "Bala",
        "Ugu", "Wayang", "Klawu", "Dukut", "Watugunung"
    };

    // Tampilkan menu pilihan biar pengguna gampang memilih nomor
    printf("list Pancawara:\n");
    for (int i = 0; i < 5; i++) {
        printf("%d. %s\n", i + 1, pancawara[i]);
    }

    printf("list Saptawara:\n");
    for (int i = 0; i < 7; i++) {
        printf("%d. %s\n", i + 1, saptawara[i]);
    }

    printf("list Wuku:\n");
    for (int i = 0; i < 30; i++) {
        printf("%d. %s\n", i + 1, wuku[i]);
    }

    // Minta input nomor otonan yang mau dicari dari pengguna
    int targetP, targetS, targetW;
    printf("Masukkan Pancawara, Saptawara, Wuku [contoh: 4 7 4]: ");
    scanf("%d %d %d", &targetP, &targetS, &targetW);

    // Ubah input pengguna ke format indeks array (dikurangi 1)
    targetP--;
    targetS--;
    targetW--;

    // Simulasi pergerakan hari: maju terus sampai pola hari yang dicari ketemu
    int hariOffset = 0;
    int nowP = startP, nowS = startS, nowW = startW;
    while (nowP != targetP || nowS != targetS || nowW != targetW) {
        hariOffset++; // Maju 1 hari

        // Geser pasaran dan hari sepekan
        nowP = (nowP + 1) % 5;
        nowS = (nowS + 1) % 7;

        // Kalau hari Saptawara balik ke Redite (0), berarti wuku berganti ke wuku berikutnya
        if (nowS == 0) {
            nowW = (nowW + 1) % 30;
        }
    }
    printf("Target ditemukan setelah %d hari dari posisi dasar.\n", hariOffset);

    // Tanggal patokan dasar kalender Masehi: 12 Maret 2025
    int baseDay = 12, baseMonth = 3, baseYear = 2025;

    // Tambahkan selisih hari tadi ke tanggal patokan buat dapat tanggal acuan pertama
    int tarDay = baseDay, tarMonth = baseMonth, tarYear = baseYear;
    addDays(&tarDay, &tarMonth, &tarYear, hariOffset);

    // Tampilkan tanggal acuan pertama dengan teks nama bulan
    printf("Tanggal base untuk pola target: %d %s %d\\n", tarDay,
           (tarMonth == 1) ? "Januari" : (tarMonth == 2) ? "Februari"
           : (tarMonth == 3) ? "Maret"
           : (tarMonth == 4) ? "April"
           : (tarMonth == 5) ? "Mei"
           : (tarMonth == 6) ? "Juni"
           : (tarMonth == 7) ? "Juli"
           : (tarMonth == 8) ? "Agustus"
           : (tarMonth == 9) ? "September"
           : (tarMonth == 10) ? "Oktober"
           : (tarMonth == 11) ? "November"
           : "Desember",
           tarYear);

    // Minta pengguna memasukkan perkiraan rentang tahun kelahiran orang tua
    int lowerYear, upperYear;
    printf("Masukkan batas tahun (misal: 1960 1970): ");
    scanf("%d %d", &lowerYear, &upperYear);

    // Siapkan variabel sementara untuk mundur ke masa lalu
    int listDay = tarDay, listMonth = tarMonth, listYear = tarYear;
    int tempDay = listDay, tempMonth = listMonth, tempYear = listYear;

    // Mundurkan tanggal kelipatan 210 hari terus-menerus sampai menyentuh batas bawah tahun
    while (tempYear > lowerYear || (tempYear == lowerYear)) {
        int prevDay = tempDay, prevMonth = tempMonth, prevYear = tempYear;
        subtractDays(&prevDay, &prevMonth, &prevYear, 210);

        // Kalau hasil mundur ternyata sudah lewat dari batas bawah tahun, hentikan perulangan
        if (prevYear < lowerYear) {
            break;
        }

        tempDay = prevDay;
        tempMonth = prevMonth;
        tempYear = prevYear;
    }

    printf("\\nDaftar tanggal untuk pola target dalam rentang %d - %d:\\n", lowerYear, upperYear);

    // Dari tanggal paling bawah tadi, maju kelipatan 210 hari dan cetak semua yang ada di rentang tahun
    while (tempYear < upperYear || (tempYear == upperYear)) {
        char *namaBulan[13] = {
            "", "Januari", "Februari", "Maret", "April",
            "Mei", "Juni", "Juli", "Agustus", "September",
            "Oktober", "November", "Desember"
        };

        printf("%d %s %d\\n", tempDay, namaBulan[tempMonth], tempYear);

        // Maju 210 hari buat mengecek tanggal otonan berikutnya
        addDays(&tempDay, &tempMonth, &tempYear, 210);
    }

    return 0;
}
\`\`\`

---

## Cara Membaca Alur Kodingan di Atas

Biar makin gampang dipahami, kita bagi kode panjang tadi ke dalam 4 bagian utama:

### 1. Mengatur Kalender Masehi Manual (addDays & subtractDays)
Karena kita pakai bahasa C murni tanpa bantuan library kalender otomatis, program harus bisa menghitung sendiri kapan bulan berganti. Kuncinya ada di fungsi cek tahun kabisat \`isLeapYear\`: kalau tahunnya habis dibagi 4, jumlah hari di bulan Februari otomatis berubah jadi 29 hari.

### 2. Memajukan Hari Sampai Pola Otonan Cocok
Program punya titik acuan tetap yaitu tanggal 12 Maret 2025. Dari tanggal ini, program menjalankan perulangan \`while\`: setiap hari maju, pasaran Pancawara dan Saptawara ditambah satu langkah. Kalau Saptawara balik ke hari Minggu (Redite), Wuku ikut bergeser ke wuku berikutnya. Begitu kombinasinya pas sama input pengguna, perulangan berhenti.

### 3. Melompat 210 Hari ke Masa Lalu
Setelah tanggal otonan pertama ketemu, program nggak perlu mengecek hari satu per satu lagi. Karena otonan pasti berulang tiap 210 hari, program langsung melompat mundur kelipatan 210 hari dengan fungsi \`subtractDays\` sampai menyentuh batas bawah tahun yang dimasukkan pengguna (misal tahun 1960).

### 4. Menampilkan Seluruh Kemungkinan Tanggal Lahir
Dari tanggal paling tua yang didapat, program tinggal melangkah maju kelipatan 210 hari dan mencetak tanggal, bulan, serta tahunnya ke layar sampai melewati batas atas tahun (misal tahun 1970). Hasil cetakan inilah yang jadi deretan kemungkinan tanggal lahir Masehi orang tua kita.

---

## Dari Terminal Hitam ke Aplikasi Web Interaktif

Kodingan C di atas awalnya cuma berjalan di layar hitam terminal komputer. Tapi dengan konsep logika yang sama, sekarang algoritmanya sudah berhasil kita sulap jadi aplikasi web modern interaktif yang bisa diakses siapa saja lewat HP.

Kamu bisa langsung mencobanya sendiri di [Kalkulator Tanggal Lahir OtonanE](https://sumestawsome.xyz/tools/cari-tanggal-lahir-otonan), cukup pilih harinya lewat menu dropdown dan klik satu tombol untuk melihat hasilnya!`,
};

async function insertSingleBlog() {
  try {
    if (emailArg && passArg) {
      console.log(`Mengotentikasi sebagai admin (${emailArg})...`);
      await signInWithEmailAndPassword(auth, emailArg, passArg);
      console.log('✅ Autentikasi admin berhasil!');
    } else {
      console.warn('⚠️ Tidak ada email/password admin yang disediakan. Menghubungi Firestore sebagai anonymous / public...');
    }

    const docRef = doc(db, 'posts', targetSlug);
    const existingSnap = await getDoc(docRef);

    const nowIso = new Date().toISOString();
    const payload = { ...blogPostData };

    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      console.log(`Dokumen "posts/${targetSlug}" sudah ada. Melindungi coverImage jika sudah diganti oleh pengguna...`);
      
      // Jika user sudah pernah mengganti cover image lewat dashboard admin, pertahankan
      if (existingData.coverImage && existingData.coverImage.url && !existingData.coverImage.url.includes('placeholder')) {
        payload.coverImage = existingData.coverImage;
      }
      payload.publishedAt = existingData.publishedAt || nowIso;
      payload.updatedAt = nowIso;
      payload.stats = existingData.stats || { views: 0, likes: 0 };
    } else {
      payload.publishedAt = nowIso;
      payload.updatedAt = nowIso;
    }

    // Tulis HANYA dokumen ini
    await setDoc(docRef, payload, { merge: true });

    console.log(`\n🎉 BERHASIL! Artikel "${payload.title}" berhasil diterbitkan ke koleksi "posts/${targetSlug}".`);
    console.log(`🔗 Slug URL: https://sumestawsome.xyz/blog/${targetSlug}`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error('\n❌ PERMISSION_DENIED: Aturan Firestore mengunci penulisan hanya untuk admin yang login.');
      console.error('👉 Pastikan ADMIN_EMAIL & ADMIN_PASSWORD terisi di .env.local atau teruskan via CLI:');
      console.error('   node scripts/add-single-blog.js --email="admin@example.com" --password="password"');
    } else {
      console.error('\n❌ Gagal menambahkan artikel ke Firestore:', error);
    }
    process.exit(1);
  }
}

insertSingleBlog();
