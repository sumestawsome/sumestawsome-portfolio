import {
  ArrowLeft,
  Award,
  GraduationCap,
  Briefcase,
  Calendar,
  Calculator,
  Palette,
  Video,
  Code,
  Cloud,
  Sparkles,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import aboutProfile from '../assets/about-profile.png';
import PageHeader from '../components/PageHeader';

function UserIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function About({ onNavigate }) {
  const waUrl =
    'https://wa.me/6285119459703?text=Halo%20Mas%20Agus,%20saya%20tertarik%20untuk%20konsultasi%20proyek';

  const skillCategories = [
    {
      title: 'Desain Grafis',
      icon: Palette,
      desc: 'Bikin identitas visual, materi promosi, poster, sampai layout UI.',
      badges: [
        {
          name: 'Adobe Photoshop',
          src: 'https://img.shields.io/badge/Adobe%20Photoshop-31A8FF?style=for-the-badge&logo=Adobe%20Photoshop&logoColor=black',
        },
        {
          name: 'Adobe Illustrator',
          src: 'https://img.shields.io/badge/Adobe%20Illustrator-FF9A00?style=for-the-badge&logo=adobe%20illustrator&logoColor=white',
        },
        {
          name: 'Canva',
          src: 'https://img.shields.io/badge/Canva-%2300C4CC.svg?style=for-the-badge&logo=Canva&logoColor=white',
        },
        {
          name: 'Figma',
          src: 'https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white',
        },
      ],
    },
    {
      title: 'Video & Animasi',
      icon: Video,
      desc: 'Editing video cerita, dokumenter, dan animasi motion graphic.',
      badges: [
        {
          name: 'Adobe After Effects',
          src: 'https://img.shields.io/badge/Adobe%20After%20Effects-CF96FD?style=for-the-badge&logo=Adobe%20after%20effects&logoColor=393665',
        },
        {
          name: 'Adobe Premiere Pro',
          src: 'https://img.shields.io/badge/Adobe%20Premiere%20Pro-9999FF?style=for-the-badge&logo=Adobe%20Premiere%20Pro&logoColor=white',
        },
        {
          name: 'CapCut',
          src: 'https://img.shields.io/badge/CapCut-000000?style=for-the-badge&logo=capcut&logoColor=white',
        },
      ],
    },
    {
      title: 'Frontend Web',
      icon: Code,
      desc: 'Membangun tampilan web interaktif, ringan, dan nyaman di semua perangkat.',
      badges: [
        {
          name: 'React',
          src: 'https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB',
        },
        {
          name: 'Tailwind CSS',
          src: 'https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white',
        },
        {
          name: 'Vite',
          src: 'https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white',
        },
        {
          name: 'Next.js',
          src: 'https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white',
        },
      ],
    },
    {
      title: 'Cloud, Platform & AI',
      icon: Cloud,
      desc: 'Hosting kilat, manajemen versi, dan integrasi bantuan AI.',
      badges: [
        {
          name: 'Firebase',
          src: 'https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white',
        },
        {
          name: 'Cloudflare',
          src: 'https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white',
        },
        {
          name: 'Git',
          src: 'https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white',
        },
        {
          name: 'Google Gemini',
          src: 'https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white',
        },
        {
          name: 'ChatGPT',
          src: 'https://img.shields.io/badge/ChatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white',
        },
      ],
    },
  ];

  const timeline = [
    {
      period: '2024 – Sekarang',
      role: 'S1 Ilmu Komputer (Teknik Informatika) – UNDIKSHA',
      badge: 'Kuliah & Organisasi',
      icon: GraduationCap,
      desc: 'Kuliah sambil aktif di kepanitiaan IT sebagai divisi Publikasi & Dokumentasi (INTEGER #6 & MISION #6).',
    },
    {
      period: '2024 – 2025',
      role: 'Founder Gabutz.id (Layanan Desain Grafis & E-commerce)',
      badge: 'Inisiatif Mandiri',
      icon: Briefcase,
      desc: 'Merintis jasa desain visual mandiri untuk UMKM, toko Shopee, dan materi promosi lokal (resmi selesai per 2025).',
    },
    {
      period: '2021 – 2024',
      role: 'SMA Negeri Bali Mandara (Multimedia SPACE)',
      badge: 'Awal Eksplorasi',
      icon: Calendar,
      desc: 'Terjun mendokumentasikan belasan event besar sekolah serta berkolaborasi bareng RRI Pro 2 Singaraja sebagai video editor film pendek.',
    },
    {
      period: 'Masa SMP',
      role: 'Langganan Olimpiade Sains Nasional (OSN) Matematika',
      badge: 'Pondasi Logika',
      icon: Calculator,
      desc: 'Aktif berkompetisi dan sering menjuarai berbagai ajang olimpiade matematika tingkat nasional, lomba matematika di Undiksha, hingga lomba matematika antar-sekolah. Dari sinilah pondasi logika problem-solving terbentuk kuat.',
    },
  ];

  const achievements = [
    {
      badge: 'Sertifikasi Global',
      title: 'Google for Education – Gemini Certified Student',
      organizer: 'Google for Education',
      detail: 'Diterbitkan: 23 September 2026 | Berlaku s.d: 2029',
      desc: 'Kualifikasi penguasaan AI dari Google (Google AI competencies).',
      icon: GraduationCap,
    },
    {
      badge: 'Sertifikasi Resmi',
      title: 'MySkill – Sertifikasi Desain Grafis (Canva for Design)',
      organizer: 'MySkill Intensive Bootcamp',
      detail: 'No. Sertifikat: MS-5/9/2024-cepfgXhOCNhO6B10QYA9',
      desc: 'Menyelesaikan kelas intensif 10 jam bersertifikat dalam penyusunan visual promosi & branding komersial.',
      icon: Award,
    },
    {
      badge: 'Juara 2',
      title: 'Juara 2 Lomba Poster Ilmiah',
      organizer: 'Dies Natalis Institut Desain & Bisnis (IDB) Bali',
      detail: 'Tahun 2023',
      desc: 'Visualisasi data ilmiah dengan struktur informasi yang estetik, komunikatif, dan tajam.',
      icon: Award,
    },
    {
      badge: 'Juara 2',
      title: 'Juara 2 Lomba Film Dokumenter',
      organizer: 'Peringatan Bulan Bung Karno',
      detail: 'Tahun 2023',
      desc: 'Penyuntingan video dokumenter sejarah dengan penataan ritme cerita, audio narasi, dan grading visual.',
      icon: Award,
    },
    {
      badge: 'Platform Internasional',
      title: 'Featured Designer di DesignCrowd.com',
      organizer: 'DesignCrowd International Contest',
      detail: 'Tahun 2024',
      desc: '2 desain lolos standar kurasi platform desain internasional bersaing dengan kreator global.',
      icon: Award,
    },
  ];

  return (
    <div className="pt-6 md:pt-8 pb-14 md:pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <PageHeader
          onNavigate={onNavigate}
          badgeText="TENTANG SAYA"
          badgeIcon={<UserIcon className="w-3.5 h-3.5" />}
          title="Profil & Perjalanan Kreatif"
          subtitle="Mengenal lebih dekat dedikasi di balik rekayasa antarmuka web, logika kode, dan eksplorasi identitas visual."
        />

        <div className="space-y-16">
          {/* Hero Profil About */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Kolom Kiri: Foto Profil berbingkai tegas */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="border-2 border-slate-900 bg-white p-3 shadow-[6px_6px_0px_0px_rgba(91,33,182,1)]">
                <div className="aspect-[4/5] bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={aboutProfile}
                    alt="Putu Agus Sumerta Yasa - sumestawsome"
                    className="w-full h-full object-cover select-none"
                    loading="eager"
                  />
                </div>
                <div className="pt-3 pb-1 border-t border-slate-200 mt-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-tight">
                      Putu Agus Sumerta Yasa
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      sumestawsome & Gabutz.id
                    </p>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 border border-primary/20">
                    S1 Ilmu Komputer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Headline & Biografi */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              “Kalau aku punya logika yang baik di matematika, kayaknya aku bisa bikin desain yang
              ngesolve banyak masalah deh, <span className="text-primary">apalagi ngoding yak?</span>”
            </h1>

            <div className="space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              <p>
                Halo, aku Putu Agus Sumerta Yasa (biasa dipanggil Agus / Sumesta). Saat ini sedang
                menempuh studi S1 Ilmu Komputer di Universitas Pendidikan Ganesha (UNDIKSHA).
              </p>
              <p>
                Ketertarikanku pada dunia kreatif berawal dari mengotak-atik visual—mulai dari
                fotografi, video editing untuk film pendek, hingga desain grafis promosi. Di bangku
                kuliah, aku memadukan kepekaan estetika tersebut dengan rekayasa web frontend. Aku
                percaya bahwa website yang bagus bukan hanya tentang kode yang berjalan tanpa
                error, melainkan tentang bagaimana antarmuka tersebut menyajikan informasi dengan
                rapi, komunikatif, dan nyaman dipandang.
              </p>
            </div>
          </div>
        </section>

        {/* Keahlian & Tools */}
        <section className="space-y-8 pt-4">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Keahlian & Tools
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Alat tempur dan teknologi yang sering aku pakai sehari-hari
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-primary/50 transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="p-3 bg-primary-light text-primary border border-primary/20">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        #0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {category.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                      {category.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    {category.badges.map((badge, bIdx) => (
                      <img
                        key={bIdx}
                        src={badge.src}
                        alt={badge.name}
                        className="h-7 object-contain select-none"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline Pengalaman & Jejak Langkah */}
        <section className="space-y-8 pt-4">
          <div className="border-b border-slate-200 pb-4">
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              JEJAK LANGKAH
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Timeline Pengalaman & Jejak Langkah
            </h2>
          </div>

          <div className="relative border-l-2 border-slate-300 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-10">
            {timeline.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <div key={index} className="relative group">
                  {/* Marker Kotak Tegas pada Garis Vertikal */}
                  <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 bg-primary border-2 border-white ring-2 ring-primary/40 inline-block" />

                  <div className="border border-slate-200 bg-white p-6 hover:border-slate-400 transition-colors shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary-light px-2.5 py-1 border border-primary/20">
                        {item.period}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-500 uppercase tracking-wider">
                        <ItemIcon className="w-3.5 h-3.5 text-primary" />
                        <span>{item.badge}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                      {item.role}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Prestasi & Sertifikasi */}
        <section className="space-y-8 pt-4">
          <div className="border-b border-slate-200 pb-4">
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              PENCAPAIAN NYATA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Prestasi & Sertifikasi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item, idx) => (
              <div
                key={idx}
                className="border border-slate-200 bg-white p-6 hover:border-primary/50 transition-colors shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 border border-primary/20">
                      <Award className="w-3.5 h-3.5" />
                      <span>{item.badge}</span>
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-medium">
                      #0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1">
                    {item.title}
                  </h3>

                  <p className="font-mono text-xs text-primary font-semibold mb-2">
                    {item.organizer}
                  </p>

                  <p className="font-mono text-[11px] text-slate-500 mb-3 bg-slate-50 p-2 border border-slate-200">
                    {item.detail}
                  </p>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Terverifikasi Resmi</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Penutup */}
        <section className="border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary bg-primary-light px-3 py-1 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KOLABORASI & KONSULTASI</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight max-w-2xl mx-auto">
            Gimana? Sudah siap kerja bareng sumestawsome?
          </h2>

          <p className="text-base text-slate-600 max-w-xl mx-auto font-normal">
            Mau bikin desain, video promosi, atau diskusi bikin website? Ngobrol santai aja dulu,
            klik tombol di bawah.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white text-base font-semibold border border-primary transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Hubungi via WhatsApp</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  const el = document.getElementById('karya');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-300 hover:bg-slate-100 text-slate-800 text-base font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Karya</span>
            </button>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
