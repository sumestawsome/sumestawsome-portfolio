import fs from 'node:fs';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

const DOMAIN = 'https://sumestawsome.xyz';
const TODAY = new Date().toISOString().slice(0, 10);

// Rute kanonikal statis utama
const STATIC_ROUTES = [
  {
    loc: `${DOMAIN}/`,
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    loc: `${DOMAIN}/blog`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    loc: `${DOMAIN}/about`,
    lastmod: '2026-10-07',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    loc: `${DOMAIN}/karya`,
    lastmod: '2026-10-07',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    loc: `${DOMAIN}/layanan`,
    lastmod: '2026-10-07',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    loc: `${DOMAIN}/tools/cari-tanggal-lahir-otonan`,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: '0.8',
  },
];

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

async function fetchPublishedBlogPosts() {
  const posts = [];

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('⚠️ [Sitemap] Kredensial Firebase tidak ditemukan di .env.local, menggunakan data fallback.');
    return posts;
  }

  try {
    const app = initializeApp(firebaseConfig, 'sitemap-generator');
    const db = getFirestore(app);
    const postsQuery = query(collection(db, 'posts'), where('status', '==', 'published'));
    const snapshot = await getDocs(postsQuery);

    snapshot.forEach((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      let lastmod = TODAY;

      if (data.updatedAt) {
        lastmod = typeof data.updatedAt === 'string'
          ? data.updatedAt.slice(0, 10)
          : data.updatedAt.toDate?.().toISOString().slice(0, 10) || TODAY;
      } else if (data.publishedAt) {
        lastmod = typeof data.publishedAt === 'string'
          ? data.publishedAt.slice(0, 10)
          : data.publishedAt.toDate?.().toISOString().slice(0, 10) || TODAY;
      }

      posts.push({
        loc: `${DOMAIN}/blog/${slug}`,
        lastmod,
        changefreq: 'monthly',
        priority: '0.8',
      });
    });

    console.log(`✅ [Sitemap] Ditemukan ${posts.length} artikel terbit dari Firestore.`);
  } catch (error) {
    console.warn('⚠️ [Sitemap] Gagal mengambil postingan dari Firestore:', error.message);
  }

  return posts;
}

function buildXml(routes) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const route of routes) {
    xml += '  <url>\n';
    xml += `    <loc>${route.loc}</loc>\n`;
    if (route.lastmod) {
      xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    }
    if (route.changefreq) {
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    }
    if (route.priority) {
      xml += `    <priority>${route.priority}</priority>\n`;
    }
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';
  return xml;
}

async function generateSitemap() {
  console.log('🔄 [Sitemap] Memulai sinkronisasi sitemap.xml...');

  const dynamicBlogRoutes = await fetchPublishedBlogPosts();

  // Fallback jika database belum ada atau koneksi gagal: pastikan artikel dasar terdaftar
  if (dynamicBlogRoutes.length === 0) {
    dynamicBlogRoutes.push(
      {
        loc: `${DOMAIN}/blog/panduan-deploy-website-ke-cloudflare-pages`,
        lastmod: '2026-10-24',
        changefreq: 'monthly',
        priority: '0.8',
      },
      {
        loc: `${DOMAIN}/blog/tutorial-setup-firebase-auth-react-nextjs`,
        lastmod: '2026-10-24',
        changefreq: 'monthly',
        priority: '0.8',
      },
      {
        loc: `${DOMAIN}/blog/belajar-deploy-website-ke-vercel`,
        lastmod: '2026-10-23',
        changefreq: 'monthly',
        priority: '0.8',
      },
      {
        loc: `${DOMAIN}/blog/cara-mencari-tanggal-lahir-dari-hari-otonan-bali`,
        lastmod: '2026-10-27',
        changefreq: 'monthly',
        priority: '0.8',
      },
      {
        loc: `${DOMAIN}/blog/menghitung-tanggal-lahir-weton-wuku-jawa-c-cpp-js`,
        lastmod: '2026-10-27',
        changefreq: 'monthly',
        priority: '0.8',
      }
    );
  }

  // Gabungkan rute statis kanonikal dan artikel dinamis
  const allRoutes = [...STATIC_ROUTES, ...dynamicBlogRoutes];

  const xmlContent = buildXml(allRoutes);
  const targetPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');

  fs.writeFileSync(targetPath, xmlContent, 'utf-8');
  console.log(`✅ [Sitemap] Berhasil memperbarui ${targetPath} dengan ${allRoutes.length} tautan kanonikal.`);
}

generateSitemap()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ [Sitemap] Gagal membuat sitemap:', err);
    process.exit(1);
  });
