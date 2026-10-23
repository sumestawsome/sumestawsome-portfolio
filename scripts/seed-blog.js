import fs from 'node:fs';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function seedBlog() {
  try {
    const jsonPath = path.resolve(process.cwd(), 'contoh_blog.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Berkas tidak ditemukan: ${jsonPath}`);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const blogData = JSON.parse(rawData);

    if (!blogData.slug) {
      throw new Error('Data blog tidak memiliki field "slug"');
    }

    console.log(`Mengunggah artikel "${blogData.title}" ke Firestore...`);
    console.log(`Target: posts/${blogData.slug}`);

    const docRef = doc(db, 'posts', blogData.slug);
    await setDoc(docRef, blogData);

    console.log('✅ BERHASIL: Data blog berhasil diunggah ke Firestore!');
    console.log(`Collection : posts`);
    console.log(`Document ID: ${blogData.slug}`);
    console.log(`Title      : ${blogData.title}`);
    console.log(`Status     : ${blogData.status}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ GAGAL mengunggah data blog ke Firestore:', error);
    process.exit(1);
  }
}

seedBlog();
