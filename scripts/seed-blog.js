import fs from 'node:fs';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Helper membaca .env.local jika belum dimuat ke process.env
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

// Parse CLI flags misal: --email=... --password=...
const args = process.argv.slice(2);
const emailArg = args.find((a) => a.startsWith('--email='))?.split('=')[1] || process.env.ADMIN_EMAIL;
const passArg = args.find((a) => a.startsWith('--password='))?.split('=')[1] || process.env.ADMIN_PASSWORD;

async function seedBlog() {
  try {
    if (emailArg && passArg) {
      console.log(`Mengotentikasi sebagai admin (${emailArg})...`);
      await signInWithEmailAndPassword(auth, emailArg, passArg);
      console.log('✅ Autentikasi admin berhasil!');
    }

    const jsonPath = path.resolve(process.cwd(), 'contoh_blog.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Berkas tidak ditemukan: ${jsonPath}`);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const parsedData = JSON.parse(rawData);
    const posts = Array.isArray(parsedData) ? parsedData : [parsedData];

    console.log(`Menemukan ${posts.length} artikel untuk disinkronkan ke Firestore...`);

    for (const post of posts) {
      if (!post.slug) {
        console.warn('⚠️ Melewati artikel tanpa field "slug"');
        continue;
      }

      console.log(`Mengunggah artikel "${post.title}" ke Firestore (posts/${post.slug})...`);
      const docRef = doc(db, 'posts', post.slug);
      await setDoc(docRef, post, { merge: true });
      console.log(`✅ Berhasil: posts/${post.slug} (${post.title})`);
    }

    console.log('🎉 Selesai: Seluruh artikel berhasil disinkronkan ke Firestore!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error('\n❌ PERMISSION_DENIED: Aturan Firestore (firestore.rules) saat ini mengunci penulisan hanya untuk admin yang login (request.auth != null).');
      console.error('👉 Solusi: Jalankan skrip ini dengan kredensial akun admin kamu:');
      console.error('   node scripts/seed-blog.js --email="email-kamu@gmail.com" --password="password-kamu"');
      console.error('   Atau simpan ADMIN_EMAIL & ADMIN_PASSWORD di berkas .env.local.');
      console.error('   Alternatif: Kamu juga bisa membuat/menyimpan artikel langsung lewat dashboard web di /admin/blog/create.\n');
    } else {
      console.error('❌ GAGAL mengunggah data blog ke Firestore:', error);
    }
    process.exit(1);
  }
}

seedBlog();
