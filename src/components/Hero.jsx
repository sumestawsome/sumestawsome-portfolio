import { useState, useEffect } from 'react';
import heroProfile from '../assets/hero-profile.png';
import { MessageSquare, ArrowDown } from 'lucide-react';

import photoshopSvg from '../assets/photoshop.svg';
import afterEffectsSvg from '../assets/after-effects.svg';
import reactSvg from '../assets/react.svg';
import tailwindSvg from '../assets/tailwindcss.svg';
import figmaSvg from '../assets/figma.svg';
import canvaSvg from '../assets/canva.svg';
import viteSvg from '../assets/vitejs.svg';
import cloudflareSvg from '../assets/cloudflare.svg';

export default function Hero() {
  const slides = [
    '● OPEN FOR FREELANCE & COLLABORATION',
    '● CREATIVE DESIGNER & FRONT-END DEVELOPER',
  ];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const waUrl =
    'https://wa.me/6285119459703?text=Halo%20Mas%20Agus,%20saya%20tertarik%20untuk%20konsultasi%20proyek';

  const orbitingBadges = [
    {
      name: 'Adobe Photoshop',
      alt: 'Adobe Photoshop',
      top: 0,
      left: 50,
      icon: photoshopSvg,
    },
    {
      name: 'Figma',
      alt: 'Figma',
      top: 14.6,
      left: 85.4,
      icon: figmaSvg,
    },
    {
      name: 'React',
      alt: 'React',
      top: 50,
      left: 100,
      icon: reactSvg,
    },
    {
      name: 'Tailwind CSS',
      alt: 'Tailwind CSS',
      top: 85.4,
      left: 85.4,
      icon: tailwindSvg,
    },
    {
      name: 'Vite',
      alt: 'Vite',
      top: 100,
      left: 50,
      icon: viteSvg,
    },
    {
      name: 'Cloudflare',
      alt: 'Cloudflare',
      top: 85.4,
      left: 14.6,
      icon: cloudflareSvg,
    },
    {
      name: 'Adobe After Effects',
      alt: 'Adobe After Effects',
      top: 50,
      left: 0,
      icon: afterEffectsSvg,
    },
    {
      name: 'Canva',
      alt: 'Canva',
      top: 14.6,
      left: 14.6,
      icon: canvaSvg,
    },
  ];

  return (
    <section className="relative overflow-x-clip pt-4 sm:pt-6 md:pt-8 pb-0 bg-white">
      {/* Scoped CSS for Keyframe Rotations & Orbit Geometry */}
      <style>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-orbit {
          animation: orbit-spin 28s linear infinite;
        }
        .animate-orbit-reverse {
          animation: orbit-reverse 28s linear infinite;
        }
        .orbit-track {
          border-radius: 9999px !important;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center lg:min-h-[580px]">
          {/* Layer 20: Left Column (Headline, Badge, & CTA) */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col items-start text-left space-y-6 relative z-20 pt-4 pb-6 md:py-8 lg:py-12">
            {/* Rotating Badge */}
            <div className="inline-flex items-center">
              <span className="font-mono text-xs text-primary bg-primary-light px-3 py-1 border border-primary/20 transition-all duration-300 inline-block">
                {slides[activeSlide]}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Bisa Desain & Bikin Web Semampunya. <br className="hidden sm:inline" />
              <span className="text-primary">Ngobrol Aja Dulu.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Aku terbuka bantu siapa pun yang mau diajak diskusi bareng. Ceritain kendala atau tujuan
              utamamu yang sebenarnya, supaya solusi yang kita buat—entah itu visual, video, atau
              web—benar-benar pas, bukan sekadar asal beres.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-6 py-3.5 border border-primary font-semibold text-base transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Konsultasi Proyek</span>
              </a>

              <a
                href="#karya"
                className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-100 text-slate-800 px-6 py-3.5 font-semibold text-base transition-colors"
              >
                <span>Ini Karyaku</span>
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column / Hero Orbit & Image */}
          <div className="md:col-span-6 lg:col-span-5 w-full flex justify-center lg:justify-end items-end relative overflow-visible">
            {/* Kontainer pembungkus foto terpadu (overflow-visible agar orbit dan kaki tembus ke MetricBar) */}
            <div className="relative w-full flex justify-center lg:justify-end items-end overflow-visible">
              <div className="relative flex justify-center items-end overflow-visible">
                {/* Layer 0 (Wadah Orbit terpusat di belakang dada/badan foto tanpa ter-crop) */}
                <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 overflow-visible">
                  {/* Outer Decorative Track Ring */}
                  <div className="orbit-track w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] lg:w-[500px] lg:h-[500px] border border-indigo-200/40 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  {/* Inner Decorative Track Ring */}
                  <div className="orbit-track w-[270px] h-[270px] sm:w-[330px] sm:h-[330px] lg:w-[380px] lg:h-[380px] border border-indigo-100/40 border-dashed rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                  {/* Rotating Orbit Container */}
                  <div className="orbit-track relative w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] lg:w-[500px] lg:h-[500px] animate-orbit animate-[spin_28s_linear_infinite]">
                    {orbitingBadges.map((badge) => (
                      <div
                        key={badge.name}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                        style={{ top: `${badge.top}%`, left: `${badge.left}%` }}
                        title={badge.name}
                      >
                        <div className="rounded-none border border-slate-200 bg-white shadow-sm p-2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 hover:border-violet-600 transition-colors animate-orbit-reverse animate-[spin_28s_linear_infinite_reverse]">
                          <img
                            src={badge.icon}
                            alt={badge.alt}
                            className="w-6 h-6 sm:w-7 sm:h-7 object-contain pointer-events-none select-none"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layer 10 (Foto Profil Hero utuh dengan overlap margin negatif ke MetricBar) */}
                <img
                  src={heroProfile}
                  alt="Putu Agus Sumerta - Web Developer & Designer Portfolio"
                  className="relative z-10 w-auto max-h-[460px] sm:max-h-[520px] lg:max-h-[580px] object-contain pointer-events-none select-none -mb-12 sm:-mb-16 lg:-mb-24"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
