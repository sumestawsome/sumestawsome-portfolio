import fs from 'node:fs';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
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

function cleanMarkdown(md = '') {
  return md
    .replace(/\[cite:\s*\d+(?:,\s*\d+)*\]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    .replace(/#+\s+/g, '')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateMetaTitle(postTitle = '') {
  const brand = ' | Sumestawsome';
  if (!postTitle) return `Blog${brand}`;
  const maxLen = 60;
  if (postTitle.includes('Sumestawsome') || postTitle.includes('Sumesta')) {
    return postTitle.length > maxLen ? postTitle.slice(0, maxLen).trim() : postTitle;
  }
  const available = maxLen - brand.length;
  const truncated = postTitle.length > available ? postTitle.slice(0, available).trim() : postTitle;
  return `${truncated}${brand}`;
}

function generateMetaDescription(post) {
  const raw = post.excerpt || post.content || '';
  const cleaned = cleanMarkdown(raw);
  const maxLen = 160;
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen).trim();
}

function generateKeywords(post) {
  const baseKeywords = ['web development', 'tutorial', 'sumestawsome'];
  let tags = [];
  if (Array.isArray(post.tags)) {
    tags = post.tags;
  } else if (typeof post.tags === 'string') {
    tags = post.tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  const combined = Array.from(new Set([...tags.map((t) => t.toLowerCase()), ...baseKeywords]));
  return combined;
}

async function auditAndFillSeo() {
  try {
    if (adminEmail && adminPassword) {
      console.log(`Mengotentikasi sebagai admin (${adminEmail})...`);
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('✅ Autentikasi admin berhasil!');
    }

    console.log('🔍 Memeriksa metadata SEO seluruh artikel di koleksi Firestore "posts"...');
    const snap = await getDocs(collection(db, 'posts'));
    let updatedCount = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const slug = data.slug || docSnap.id;
      const existingSeo = data.seo || {};

      let needsUpdate = false;
      const updates = {};

      // 1. Periksa metaTitle
      const currentMetaTitle = data.metaTitle || existingSeo.metaTitle;
      const targetMetaTitle = currentMetaTitle || generateMetaTitle(data.title);
      if (!currentMetaTitle) {
        needsUpdate = true;
      }

      // 2. Periksa metaDescription
      const currentMetaDesc = data.metaDescription || existingSeo.metaDescription;
      const targetMetaDesc = currentMetaDesc || generateMetaDescription(data);
      if (!currentMetaDesc) {
        needsUpdate = true;
      }

      // 3. Periksa keywords
      const currentKeywords = data.keywords || existingSeo.keywords;
      const hasKeywords =
        (Array.isArray(currentKeywords) && currentKeywords.length > 0) ||
        (typeof currentKeywords === 'string' && currentKeywords.trim().length > 0);
      const targetKeywords = hasKeywords
        ? (Array.isArray(currentKeywords) ? currentKeywords : currentKeywords.split(',').map((k) => k.trim()))
        : generateKeywords(data);
      if (!hasKeywords) {
        needsUpdate = true;
      }

      // 4. Pastikan canonicalUrl ada
      const currentCanonical = data.canonicalUrl || existingSeo.canonicalUrl;
      const targetCanonical = currentCanonical || `https://sumestawsome.xyz/blog/${slug}`;
      if (!currentCanonical) {
        needsUpdate = true;
      }

      // Pastikan root dan objek seo tersinkronisasi
      if (
        !data.metaTitle ||
        !data.metaDescription ||
        !data.keywords ||
        !data.seo?.metaTitle ||
        !data.seo?.metaDescription ||
        !data.seo?.keywords
      ) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        const updatedSeo = {
          ...existingSeo,
          metaTitle: targetMetaTitle,
          metaDescription: targetMetaDesc,
          keywords: targetKeywords,
          canonicalUrl: targetCanonical,
          ogType: existingSeo.ogType || 'article',
          noIndex: Boolean(existingSeo.noIndex),
        };

        const payload = {
          metaTitle: targetMetaTitle,
          metaDescription: targetMetaDesc,
          keywords: targetKeywords,
          seo: updatedSeo,
          updatedAt: new Date().toISOString(),
        };

        const docRef = doc(db, 'posts', docSnap.id);
        await updateDoc(docRef, payload);

        console.log(`✅ [UPDATED] posts/${docSnap.id}`);
        console.log(`   - Title: "${targetMetaTitle}"`);
        console.log(`   - Desc: "${targetMetaDesc.slice(0, 70)}..."`);
        console.log(`   - Keywords (${targetKeywords.length}): ${targetKeywords.slice(0, 4).join(', ')}...`);
        updatedCount++;
      } else {
        console.log(`✓ [OK] posts/${docSnap.id} sudah memiliki metadata SEO lengkap.`);
      }
    }

    console.log(`\n🎉 Selesai! ${updatedCount} dokumen diperbarui, ${snap.size - updatedCount} dokumen sudah lengkap.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat audit SEO:', error);
    process.exit(1);
  }
}

auditAndFillSeo();
