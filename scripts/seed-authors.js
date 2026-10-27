import fs from 'node:fs';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

const DEFAULT_AUTHORS = [
  {
    id: 'agus',
    name: 'Putu Agus Sumerta Yasa',
    role: 'Frontend Developer & Graphic Designer',
    avatar: 'https://ui-avatars.com/api/?name=Putu+Agus&background=2563eb&color=fff&bold=true',
    url: 'https://sumestawsome.xyz',
  },
  {
    id: 'admin',
    name: 'Admin Sumesta',
    role: 'Full-stack developer & tech enthusiast.',
    avatar: 'https://ui-avatars.com/api/?name=Admin+Sumesta&background=0f172a&color=fff&bold=true',
    url: 'https://sumestawsome.xyz',
  },
];

async function seedAuthors() {
  try {
    if (adminEmail && adminPassword) {
      console.log(`Mengotentikasi sebagai admin (${adminEmail})...`);
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('✅ Autentikasi admin berhasil!');
    }

    const nowIso = new Date().toISOString();

    for (const author of DEFAULT_AUTHORS) {
      const docRef = doc(db, 'authors', author.id);
      const snap = await getDoc(docRef);

      const payload = {
        ...author,
        updatedAt: nowIso,
        createdAt: snap.exists() ? snap.data().createdAt || nowIso : nowIso,
      };

      await setDoc(docRef, payload, { merge: true });
      console.log(`✅ Berhasil mendaftarkan penulis: authors/${author.id} (${author.name})`);
    }

    console.log('\n🎉 Selesai menginisialisasi koleksi "authors" di Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal menginisialisasi koleksi authors:', error);
    process.exit(1);
  }
}

seedAuthors();
