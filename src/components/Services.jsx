import { Palette, Video, Code2, Check, Wrench } from 'lucide-react';

export default function Services() {
  const services = [
    {
      title: 'Desain Grafis',
      tools: 'Photoshop / Illustrator / Canva',
      desc: 'Pembuatan materi visual komunikatif untuk identitas brand, media sosial, banner promosi, hingga digital imaging beresolusi tinggi.',
      icon: Palette,
      items: [
        'Desain Konten & Feed Instagram',
        'Digital Imaging & Retouching Visual',
        'Poster, Banner, & Visual Branding',
        'Aset Grafis Siap Cetak & Digital',
      ],
    },
    {
      title: 'Video & Motion',
      tools: 'After Effects / Premiere / CapCut',
      desc: 'Produksi video animasi dan editing dinamis yang menyampaikan pesan edukasi atau promosi secara hidup dan tidak membosankan.',
      icon: Video,
      items: [
        'Motion Graphic Edukasi & Explainer',
        'Editing Video Pendek (Reels / TikTok)',
        'Bumper Intro & Title Animation',
        'Penyelarasan Audio & Visual Pace',
      ],
    },
    {
      title: 'Web Frontend',
      tools: 'React / Vite / Tailwind CSS',
      desc: 'Pengembangan antarmuka website modern dengan struktur kode rapi, loading gesit, responsif di berbagai gadget, dan estetika visual presisi.',
      icon: Code2,
      items: [
        'Landing Page Bisnis & Portofolio',
        'Single Page Application (SPA)',
        'Slicing Desain ke Kode Responsif',
        'Integrasi Komponen & Animasi Halus',
      ],
    },
  ];

  return (
    <section id="layanan" className="py-16 md:py-24 bg-white border-t border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-primary bg-primary-light px-3 py-1 border border-primary/20 mb-3">
              <Wrench className="w-3.5 h-3.5" />
              <span>BIDANG KEAHLIAN & LAYANAN</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Solusi Visual & Web Terintegrasi
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-md">
            Membantu merancang ide dari sketsa konsep visual sampai menjadi produk digital yang
            fungsional dan estetik.
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white border border-slate-200 p-6 sm:p-8 rounded-none transition-all duration-300 relative cursor-pointer hover:bg-[#6D28D9] hover:border-[#6D28D9] hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon & Tools badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-10 h-10 border border-slate-200 text-[#4F46E5] bg-white flex items-center justify-center rounded-none group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="bg-slate-50 text-slate-400 border border-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-none group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white transition-colors duration-300">
                      Pilar 0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-slate-900 font-bold text-lg sm:text-xl tracking-tight mb-1 group-hover:text-white transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="font-mono text-violet-600 text-xs font-semibold mb-4 group-hover:text-violet-200 transition-colors duration-300">
                    {service.tools}
                  </p>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal group-hover:text-violet-100 transition-colors duration-300">
                    {service.desc}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-200 group-hover:border-white/20 transition-colors duration-300">
                    {service.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 group-hover:text-white transition-colors duration-300"
                      >
                        <span className="p-0.5 bg-violet-100 text-violet-600 rounded-none shrink-0 mt-0.5 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
