import { MessageSquare, Send, ArrowUpRight } from 'lucide-react';

function GithubIcon({ className = 'w-5 h-5' }) {
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
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-5 h-5' }) {
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
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-5 h-5' }) {
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
      <rect x="2" y="2" width="20" height="20" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Contact() {
  const waUrl =
    'https://wa.me/6285119459703?text=Halo%20Mas%20Agus,%20saya%20tertarik%20untuk%20konsultasi%20proyek';

  const contacts = [
    {
      name: 'WhatsApp',
      handle: '+62 851-1945-9703',
      href: waUrl,
      icon: MessageSquare,
      badge: 'Respon Cepat',
    },
    {
      name: 'LinkedIn',
      handle: 'Putu Agus Sumerta Yasa',
      href: 'https://www.linkedin.com/in/putu-agus-sumerta-yasa',
      icon: LinkedinIcon,
      badge: 'Professional',
    },
    {
      name: 'GitHub',
      handle: '@sumestawsome',
      href: 'https://github.com/sumestawsome',
      icon: GithubIcon,
      badge: 'Code Repos',
    },
    {
      name: 'Instagram',
      handle: '@agus_sumesta',
      href: 'https://www.instagram.com/agus_sumesta/',
      icon: InstagramIcon,
      badge: 'Visual Gallery',
    },
  ];

  return (
    <section id="kontak" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-slate-200 bg-white p-6 sm:p-10 md:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-primary bg-primary-light px-3 py-1 border border-primary/20">
                <Send className="w-3.5 h-3.5" />
                <span>MULAI DISKUSI</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Punya Ide Menarik? <br />
                <span className="text-primary">Mari Bicara Santai.</span>
              </h2>

              <p className="text-base text-slate-600 leading-relaxed font-normal">
                Tak perlu sungkan atau menunggu konsepmu sempurna. Baik sekadar tanya tarif, konsultasi
                teknis frontend, atau diskusi gaya visual video/desain, ruang obrolan selalu terbuka.
              </p>

              <div className="pt-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white text-base font-semibold border border-primary transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Kirim Pesan WhatsApp Sekarang</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Column: Direct Channels Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contacts.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 border border-slate-200 bg-slate-50 hover:bg-white hover:border-primary/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2.5 bg-white text-slate-800 group-hover:text-primary border border-slate-200 transition-colors">
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 border border-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base mb-1">
                        {item.name}
                      </h4>
                      <p className="font-mono text-xs text-slate-500 truncate">
                        {item.handle}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-primary">
                      <span>Buka Tautan</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
