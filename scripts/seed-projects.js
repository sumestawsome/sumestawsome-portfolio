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

// Daftar 21 karya portofolio terstandarisasi
const projectsData = [
  {
    slug: 'website-e-commerce-tokosaya',
    title: 'Website E-Commerce TokoSaya',
    category: 'Web Development',
    badge: 'React + Cloudflare',
    excerpt: 'Platform e-commerce neo-minimalist kotak tegas (sharp edges) lengkap dengan filter per kata utuh, keranjang belanja real-time LocalStorage, dan panel admin terproteksi.',
    description: 'Platform e-commerce neo-minimalist kotak tegas (sharp edges) lengkap dengan filter per kata utuh, keranjang belanja real-time LocalStorage, dan panel admin terproteksi.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791253452/Screenshot_2026-10-06_102344_sx1sey.png',
    tags: ['React', 'Tailwind CSS', 'Vite', 'Context API', 'Cloudflare Pages'],
    demoUrl: 'https://toko-saya.pages.dev/',
    projectUrl: 'https://toko-saya.pages.dev/',
    repoUrl: 'https://github.com/sumestawsome',
    isFeatured: true,
    order: 1,
    createdAt: '2026-10-06T10:23:44.000Z',
  },
  {
    slug: 'proyek-pelatihan-photoshop-myskill',
    title: 'Proyek Pelatihan Adobe Photoshop dari MySkill',
    category: 'Desain Grafis',
    badge: 'Pelatihan Bersertifikat',
    excerpt: 'Kumpulan karya pelatihan intensif berfokus pada teknik retouching wajah natural, manipulasi foto sureal, dan editing produk komersial.',
    description: 'Kumpulan karya pelatihan intensif berfokus pada teknik retouching wajah natural, manipulasi foto sureal, dan editing produk komersial.',
    coverImage: 'https://res.cloudinary.com/dvcraeuqz/image/upload/v1759703223/auwvzqospiqpcupe6mmr.png',
    tags: ['Adobe Photoshop', 'Digital Imaging', 'Typography', 'Visual Composition'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=I0V5g4D9FIL9UknRV1lk',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=I0V5g4D9FIL9UknRV1lk',
    repoUrl: '',
    isFeatured: true,
    order: 2,
    createdAt: '2025-01-10T12:00:00.000Z',
  },
  {
    slug: 'video-animasi-edukasi-plastik',
    title: 'Video Animasi Edukasi "Dari Plastik ke Praktik"',
    category: 'Multimedia',
    badge: 'Lomba Animasi',
    excerpt: 'Video motion graphic naratif tentang siklus pengolahan sampah plastik yang meraih Juara Harapan 1 Lomba Nasional WED 2025.',
    description: 'Video motion graphic naratif tentang siklus pengolahan sampah plastik yang meraih Juara Harapan 1 Lomba Nasional WED 2025.',
    coverImage: 'https://res.cloudinary.com/dvcraeuqz/image/upload/v1759602466/uum3ni34swubza3brzbg.png',
    tags: ['After Effects', 'Premiere Pro', 'Illustrator', 'Motion Graphic'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=qCyoqZ9mtDZcPMWsKNyR',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=qCyoqZ9mtDZcPMWsKNyR',
    repoUrl: '',
    isFeatured: true,
    order: 3,
    createdAt: '2025-06-05T08:00:00.000Z',
  },
  {
    slug: 'website-portofolio-v1',
    title: 'Website Portofolio',
    category: 'Web Development',
    badge: 'Vanilla Web',
    excerpt: 'Website portofolio pribadi responsif yang dibuat menggunakan template HTML dan CSS murni tanpa framework untuk menampilkan karya visual dan digital.',
    description: 'Website portofolio pribadi responsif yang dibuat menggunakan template HTML dan CSS murni tanpa framework untuk menampilkan karya visual dan digital.',
    coverImage: 'https://sumestawsome.github.io/tailwindcssandjquery/assets/project1.png',
    tags: ['HTML', 'CSS', 'JavaScript'],
    demoUrl: 'https://sumesta-df6a8.web.app/',
    projectUrl: 'https://sumesta-df6a8.web.app/',
    repoUrl: 'https://github.com/sumestawsome',
    isFeatured: false,
    order: 4,
    createdAt: '2025-02-01T00:00:00.000Z',
  },
  {
    slug: 'website-indopride-store',
    title: 'Website Indopride Store',
    category: 'Web Development',
    badge: 'Toko Online',
    excerpt: 'Website toko online e-commerce modern dengan integrasi database Firebase Firestore untuk manajemen inventaris produk dan pesanan.',
    description: 'Website toko online e-commerce modern dengan integrasi database Firebase Firestore untuk manajemen inventaris produk dan pesanan.',
    coverImage: 'https://sumestawsome.github.io/tailwindcssandjquery/assets/project2.png',
    tags: ['HTML', 'CSS', 'JavaScript', 'Firebase Firestore'],
    demoUrl: 'https://indopride.top',
    projectUrl: 'https://indopride.top',
    repoUrl: '',
    isFeatured: false,
    order: 5,
    createdAt: '2025-03-01T00:00:00.000Z',
  },
  {
    slug: 'website-jobdex-in',
    title: 'Website jobdex-in.vercel.app',
    category: 'Web Development',
    badge: 'Jadwal & Bot WA',
    excerpt: 'Platform pengatur jadwal berbasis web yang terintegrasi dengan WhatsApp grup dan dideploy otomatis di infrastruktur cloud Vercel.',
    description: 'Platform pengatur jadwal berbasis web yang terintegrasi dengan WhatsApp grup dan dideploy otomatis di infrastruktur cloud Vercel.',
    coverImage: 'https://sumestawsome.github.io/tailwindcssandjquery/assets/project3.png',
    tags: ['HTML', 'CSS', 'JavaScript', 'Vercel', 'Firebase Firestore'],
    demoUrl: 'https://jobdex-in.vercel.app/',
    projectUrl: 'https://jobdex-in.vercel.app/',
    repoUrl: '',
    isFeatured: false,
    order: 6,
    createdAt: '2025-04-01T00:00:00.000Z',
  },
  {
    slug: 'website-portfolio-gede-bali-guide',
    title: 'Website Portfolio Gede Bali Guide',
    category: 'Web Development',
    badge: 'Tour Guide Bali',
    excerpt: 'Website portofolio tour guide Bali dengan pengelolaan konten dinamis blog dan galeri wisata secara mandiri berbasis Next.js.',
    description: 'Website portofolio tour guide Bali dengan pengelolaan konten dinamis blog dan galeri wisata secara mandiri berbasis Next.js.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791253003/Screenshot_2026-10-06_101510_wexdfy.png',
    tags: ['Next.js', 'Tailwind CSS', 'Firebase', 'Vercel'],
    demoUrl: 'https://gedebaliguide.vercel.app/',
    projectUrl: 'https://gedebaliguide.vercel.app/',
    repoUrl: '',
    isFeatured: false,
    order: 7,
    createdAt: '2025-05-01T00:00:00.000Z',
  },
  {
    slug: 'desain-konten-media-sosial-pkm',
    title: 'Desain Konten Media Sosial untuk Tim PKM',
    category: 'Desain Grafis',
    badge: 'Publikasi Ilmiah',
    excerpt: 'Perancangan materi publikasi visual dan feed media sosial yang informatif untuk meningkatkan eksposur program kreativitas mahasiswa.',
    description: 'Perancangan materi publikasi visual dan feed media sosial yang informatif untuk meningkatkan eksposur program kreativitas mahasiswa.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277732/MENERIMA_Projek_DESAIN_KEPERLUAN_PKM_MAHASISWA_p2cnqg.png',
    tags: ['Adobe Photoshop', 'Canva'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=qjYUuzflWwkaZu0d8bk3',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=qjYUuzflWwkaZu0d8bk3',
    repoUrl: '',
    isFeatured: false,
    order: 8,
    createdAt: '2025-08-01T00:00:00.000Z',
  },
  {
    slug: 'volunteer-media-video-editor-bulfest-2025',
    title: 'Volunteer Media & Video Editor Bulfest 2025',
    category: 'Multimedia',
    badge: 'Festival Buleleng',
    excerpt: 'Produksi konten video dokumentasi cepat dan pengelolaan publikasi reels/story resmi selama perhelatan Buleleng Festival 2025.',
    description: 'Produksi konten video dokumentasi cepat dan pengelolaan publikasi reels/story resmi selama perhelatan Buleleng Festival 2025.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277731/Volunteer_bulfest_2025_ds5dre.png',
    tags: ['CapCut', 'Adobe Premiere Pro'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=yOPM9uFq1uX40R7OXdvE',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=yOPM9uFq1uX40R7OXdvE',
    repoUrl: '',
    isFeatured: false,
    order: 9,
    createdAt: '2025-08-25T00:00:00.000Z',
  },
  {
    slug: 'desain-publikasi-talk-sustainable-4',
    title: 'Desain Publikasi Talk Sustainable #4',
    category: 'Desain Grafis',
    badge: 'Kampanye Lingkungan',
    excerpt: 'Pembuatan materi publikasi terpadu kampanye keberlanjutan lingkungan mulai dari poster webinar, feed Instagram, hingga mockup merchandise.',
    description: 'Pembuatan materi publikasi terpadu kampanye keberlanjutan lingkungan mulai dari poster webinar, feed Instagram, hingga mockup merchandise.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277731/Desain_keperluan_VOLUNTEER_talk_sustainable_ooc4fv.png',
    tags: ['Adobe Illustrator', 'Adobe Photoshop'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=DsNgzVT1mUzN5mI63NBy',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=DsNgzVT1mUzN5mI63NBy',
    repoUrl: '',
    isFeatured: false,
    order: 10,
    createdAt: '2025-05-01T00:00:00.000Z',
  },
  {
    slug: 'pengelolaan-konten-visual-aseec-edu',
    title: 'Pengelolaan Konten Visual Aseec Edu',
    category: 'Multimedia',
    badge: 'Media Edukasi',
    excerpt: 'Produksi infografis edukasi dan video motion reels interaktif untuk meningkatkan engagement akun media sosial Aseec Edu.',
    description: 'Produksi infografis edukasi dan video motion reels interaktif untuk meningkatkan engagement akun media sosial Aseec Edu.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277734/Projek_aseec_edu_2025_flytu6.png',
    tags: ['Adobe Illustrator', 'Adobe After Effects'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=rHn7Qs5f46fAxIPup7vP',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=rHn7Qs5f46fAxIPup7vP',
    repoUrl: '',
    isFeatured: false,
    order: 11,
    createdAt: '2025-05-15T00:00:00.000Z',
  },
  {
    slug: 'desain-branding-visual-mkmb-2025',
    title: 'Desain Branding Visual MKMB 2025',
    category: 'Desain Grafis',
    badge: 'Branding Acara',
    excerpt: 'Identitas visual acara penyambutan mahasiswa baru yang memuat desain twibbon, nametag resmi peserta, dan dekorasi photobooth.',
    description: 'Identitas visual acara penyambutan mahasiswa baru yang memuat desain twibbon, nametag resmi peserta, dan dekorasi photobooth.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277734/Projek_desain_MKMB_2025_e4r9md.png',
    tags: ['Adobe Illustrator', 'Adobe Photoshop'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=CdEr8BJewrEDl16YoJ9n',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=CdEr8BJewrEDl16YoJ9n',
    repoUrl: '',
    isFeatured: false,
    order: 12,
    createdAt: '2025-10-31T00:00:00.000Z',
  },
  {
    slug: 'manajemen-konten-humediktif-forkom',
    title: 'Manajemen Konten Media Sosial HUMEDIKTIF FORKOM',
    category: 'Desain Grafis',
    badge: 'Humas Organisasi',
    excerpt: 'Pengelolaan kalender editorial, perancangan layout feed informasi beasiswa, dan animasi bumper video untuk media sosial organisasi.',
    description: 'Pengelolaan kalender editorial, perancangan layout feed informasi beasiswa, dan animasi bumper video untuk media sosial organisasi.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277732/Projek_desain_HUMEDIKTIF_2025_kalwux.png',
    tags: ['Adobe Illustrator', 'Adobe After Effects'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=HmR2i5UK0RRVFhjxiWxs',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=HmR2i5UK0RRVFhjxiWxs',
    repoUrl: '',
    isFeatured: false,
    order: 13,
    createdAt: '2025-06-01T00:00:00.000Z',
  },
  {
    slug: 'dokumentasi-video-desain-pdk-forkom-2025',
    title: 'Dokumentasi Video & Desain PDK FORKOM 2025',
    category: 'Multimedia',
    badge: 'Aftermovie Event',
    excerpt: 'Produksi video aftermovie sinematik dan penyusunan aset visual nametag pada kegiatan Pelatihan Dasar Kepemimpinan 2025.',
    description: 'Produksi video aftermovie sinematik dan penyusunan aset visual nametag pada kegiatan Pelatihan Dasar Kepemimpinan 2025.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277734/Projek_desain_PDK_2025_pwopwz.png',
    tags: ['Adobe Illustrator', 'Adobe After Effects', 'Canva'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=kgt5INNwPFJvcjO1gFdc',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=kgt5INNwPFJvcjO1gFdc',
    repoUrl: '',
    isFeatured: false,
    order: 14,
    createdAt: '2025-07-20T00:00:00.000Z',
  },
  {
    slug: 'desain-konten-visual-pkkmb-undiksha',
    title: 'Desain Konten Visual & Promosi PKKMB Undiksha',
    category: 'Desain Grafis',
    badge: 'Kampus Undiksha',
    excerpt: 'Aset kampanye digital pengenalan kampus untuk ribuan mahasiswa baru yang meliputi twibbon resmi, feed pengumuman, dan video recap.',
    description: 'Aset kampanye digital pengenalan kampus untuk ribuan mahasiswa baru yang meliputi twibbon resmi, feed pengumuman, dan video recap.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277738/projek_kepanitiaan_PKKMB_Undiksha_2025_r0bttj.png',
    tags: ['Adobe Illustrator', 'Adobe After Effects', 'Canva'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=ZsrpBsPKGEhEocMtOckK',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=ZsrpBsPKGEhEocMtOckK',
    repoUrl: '',
    isFeatured: false,
    order: 15,
    createdAt: '2025-08-17T00:00:00.000Z',
  },
  {
    slug: 'video-animasi-looping-suksesi-2025',
    title: 'Video Animasi Looping SUKSESI 2025',
    category: 'Multimedia',
    badge: 'Videotron Display',
    excerpt: 'Motion graphics animasi looping resolusi tinggi yang ditayangkan terus-menerus di layar videotron sebagai media promosi suksesi.',
    description: 'Motion graphics animasi looping resolusi tinggi yang ditayangkan terus-menerus di layar videotron sebagai media promosi suksesi.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277734/Projek_desain_SUKSESI_FORKOM_2025_bm5e2a.png',
    tags: ['Adobe After Effects', 'Adobe Premiere Pro'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=3Xt1AToAi01VMdOehZyF',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=3Xt1AToAi01VMdOehZyF',
    repoUrl: '',
    isFeatured: false,
    order: 16,
    createdAt: '2025-05-13T00:00:00.000Z',
  },
  {
    slug: 'desain-visual-branding-mision-6',
    title: 'Desain Visual & Branding Acara MISION #6',
    category: 'Desain Grafis',
    badge: 'Panggung & Identitas',
    excerpt: 'Branding komersial dan panggung acara yang memadukan ornamen seni khas Bali Ganesha dengan tipografi modern kewirausahaan.',
    description: 'Branding komersial dan panggung acara yang memadukan ornamen seni khas Bali Ganesha dengan tipografi modern kewirausahaan.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277735/Projek_desain_MISION_6_h3kmld.png',
    tags: ['Adobe Illustrator', 'Adobe Photoshop'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=sLS5kX51wjBZaQYshV2R',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=sLS5kX51wjBZaQYshV2R',
    repoUrl: '',
    isFeatured: false,
    order: 17,
    createdAt: '2025-03-25T00:00:00.000Z',
  },
  {
    slug: 'desain-visual-acara-integer-6',
    title: 'Desain Visual Acara INTEGER #6',
    category: 'Desain Grafis',
    badge: 'Festival TI',
    excerpt: 'Identitas visual bertema teknologi futuristik untuk festival akbar Teknik Informatika Undiksha, mencakup poster, lanyard, dan banner.',
    description: 'Identitas visual bertema teknologi futuristik untuk festival akbar Teknik Informatika Undiksha, mencakup poster, lanyard, dan banner.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277733/Projek_desain_INTEGER_6_bmpekh.png',
    tags: ['Adobe Illustrator', 'Adobe Photoshop'],
    demoUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=EmlghGiiKcvl7TRRbNBj',
    projectUrl: 'https://sumesta-df6a8.web.app/project-details.html?id=EmlghGiiKcvl7TRRbNBj',
    repoUrl: '',
    isFeatured: false,
    order: 18,
    createdAt: '2024-12-11T00:00:00.000Z',
  },
  {
    slug: 'seri-film-pendek-pro-2-rri-singaraja',
    title: 'Seri Film Pendek - Kolaborasi PRO 2 RRI Singaraja',
    category: 'Multimedia',
    badge: 'Sinematografi RRI',
    excerpt: 'Produksi seri film pendek (Swara, Vancaka, Anagata, Anagata 2) hasil kolaborasi bersama PRO 2 RRI Singaraja dengan peran sebagai penata kamera dan editor film.',
    description: 'Produksi seri film pendek (Swara, Vancaka, Anagata, Anagata 2) hasil kolaborasi bersama PRO 2 RRI Singaraja dengan peran sebagai penata kamera dan editor film.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277738/projek_kolaborasi_dengan_pro_2_rri_singaraja_i9w4gn.png',
    tags: ['Adobe Premiere Pro', 'Adobe After Effects', 'Sinematografi'],
    demoUrl: 'https://www.instagram.com/rri_singaraja/',
    projectUrl: 'https://www.instagram.com/rri_singaraja/',
    repoUrl: '',
    isFeatured: false,
    order: 19,
    createdAt: '2025-06-15T00:00:00.000Z',
  },
  {
    slug: 'desain-identitas-publikasi-integer-7',
    title: 'Desain Identitas Publikasi INTEGER #7',
    category: 'Desain Grafis',
    badge: 'Turnamen & Media',
    excerpt: 'Perancangan materi publikasi visual untuk rangkaian acara INTEGER #7 yang meliputi poster opening ceremony, feed Instagram, banner turnamen futsal TI Cup, dan twibbon.',
    description: 'Perancangan materi publikasi visual untuk rangkaian acara INTEGER #7 yang meliputi poster opening ceremony, feed Instagram, banner turnamen futsal TI Cup, dan twibbon.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791277732/Projek_desain_INTEGER_7_m0erci.png',
    tags: ['Adobe Photoshop', 'Canva', 'Media Sosial'],
    demoUrl: 'https://www.instagram.com/integer.hmjtiundiksha/',
    projectUrl: 'https://www.instagram.com/integer.hmjtiundiksha/',
    repoUrl: '',
    isFeatured: false,
    order: 20,
    createdAt: '2025-09-01T00:00:00.000Z',
  },
  {
    slug: 'desain-ui-ux-design-system-sumesta',
    title: 'Perancangan Prototipe UI/UX & Design System',
    category: 'UI/UX Design',
    badge: 'Figma Prototype',
    excerpt: 'Eksplorasi perancangan antarmuka aplikasi digital berbasis design system konsisten, wireframing interaktif, dan prototipe user journey yang intuitif.',
    description: 'Eksplorasi perancangan antarmuka aplikasi digital berbasis design system konsisten, wireframing interaktif, dan prototipe user journey yang intuitif.',
    coverImage: 'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791253452/Screenshot_2026-10-06_102344_sx1sey.png',
    tags: ['Figma', 'UI/UX', 'Design System', 'Wireframing', 'Prototyping'],
    demoUrl: 'https://sumestawsome.xyz/karya',
    projectUrl: 'https://sumestawsome.xyz/karya',
    repoUrl: '',
    isFeatured: false,
    order: 21,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
];

async function seedProjects() {
  try {
    if (emailArg && passArg) {
      console.log(`Mengotentikasi sebagai admin (${emailArg})...`);
      await signInWithEmailAndPassword(auth, emailArg, passArg);
      console.log('✅ Autentikasi admin berhasil!');
    }

    console.log(`Menemukan ${projectsData.length} karya untuk disinkronkan ke Firestore (koleksi "projects")...`);

    for (const project of projectsData) {
      if (!project.slug) {
        console.warn('⚠️ Melewati proyek tanpa field "slug"');
        continue;
      }

      console.log(`Mengunggah karya "${project.title}" ke Firestore (projects/${project.slug})...`);
      const docRef = doc(db, 'projects', project.slug);
      
      const payload = {
        id: project.slug,
        slug: project.slug,
        title: project.title,
        category: project.category,
        badge: project.badge || '',
        excerpt: project.excerpt || project.description,
        description: project.description || project.excerpt,
        coverImage: project.coverImage,
        tags: Array.isArray(project.tags) ? project.tags : [],
        demoUrl: project.demoUrl || '',
        projectUrl: project.projectUrl || project.demoUrl || '',
        repoUrl: project.repoUrl || '',
        isFeatured: Boolean(project.isFeatured),
        order: Number(project.order) || 99,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(docRef, payload, { merge: true });
      console.log(`✅ Berhasil: projects/${project.slug} [Featured: ${payload.isFeatured ? '⭐ YA' : 'TIDAK'}]`);
    }

    console.log(`\n🎉 Selesai: Seluruh ${projectsData.length} karya berhasil disinkronkan ke koleksi Firestore "projects"!`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error('\n❌ PERMISSION_DENIED: Aturan Firestore (firestore.rules) saat ini mengunci penulisan hanya untuk admin yang login (request.auth != null).');
      console.error('👉 Solusi: Jalankan skrip ini dengan kredensial akun admin:');
      console.error('   node scripts/seed-projects.js --email="email-kamu@gmail.com" --password="password-kamu"');
      console.error('   Atau simpan ADMIN_EMAIL & ADMIN_PASSWORD di berkas .env.local.\n');
    } else {
      console.error('❌ GAGAL mengunggah data karya ke Firestore:', error);
    }
    process.exit(1);
  }
}

seedProjects();
