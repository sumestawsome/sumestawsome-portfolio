import { useState, useEffect } from 'react';
import heroProfile from '../assets/hero-profile.png';
import { MessageSquare, ArrowDown } from 'lucide-react';

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

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left / Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
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

          {/* Right / Hero Image */}
          <div className="lg:col-span-5 w-full flex justify-center items-center">
            {/* Wrapper memenuhi lebar area mobile (max-w-sm sm:max-w-md aspect-[4/5]), proporsional menyatu ke background */}
            <div className="w-full max-w-sm sm:max-w-md mx-auto aspect-[4/5] flex items-center justify-center">
              <img
                src={heroProfile}
                alt="Profil sumestawsome"
                className="w-full h-auto object-cover select-none"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
