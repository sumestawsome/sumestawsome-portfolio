import { MessageSquare, ArrowUp } from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }) {
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

function LinkedinIcon({ className = 'w-4 h-4' }) {
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

function InstagramIcon({ className = 'w-4 h-4' }) {
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

export default function Footer({ currentView = 'home', onNavigate = () => {} }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e, href) => {
    if (currentView === 'about') {
      e.preventDefault();
      onNavigate('home');
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const waUrl =
    'https://wa.me/6285119459703?text=Halo%20Mas%20Agus,%20saya%20tertarik%20untuk%20konsultasi%20proyek';

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 mb-2 group inline-block"
            >
              <span className="w-3 h-3 bg-semesta inline-block transition-transform duration-300 group-hover:rotate-45" />
              <span className="font-mono text-lg font-bold tracking-tight text-slate-900 group-hover:text-semesta transition-colors">
                sumestawsome
              </span>
            </a>
            <p className="text-sm text-slate-600 max-w-sm font-normal">
              Eksplorasi visual, video motion, dan rekayasa web frontend dengan pendekatan presisi &
              desain tegas.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-2.5 border border-slate-200 text-slate-700 hover:text-semesta hover:border-semesta transition-colors bg-slate-50"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/sumestawsome"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2.5 border border-slate-200 text-slate-700 hover:text-semesta hover:border-semesta transition-colors bg-slate-50"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/putu-agus-sumerta-yasa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2.5 border border-slate-200 text-slate-700 hover:text-semesta hover:border-semesta transition-colors bg-slate-50"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/agus_sumesta/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2.5 border border-slate-200 text-slate-700 hover:text-semesta hover:border-semesta transition-colors bg-slate-50"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="p-2.5 border border-slate-200 text-slate-700 hover:text-semesta hover:border-semesta transition-colors bg-slate-50 ml-2"
              title="Kembali ke atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs font-mono text-slate-500">
          <p>© {new Date().getFullYear()} sumestawsome. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <a
              href="#karya"
              onClick={(e) => handleLinkClick(e, '#karya')}
              className="hover:text-semesta transition-colors"
            >
              Karya
            </a>
            <span>•</span>
            <a
              href="#layanan"
              onClick={(e) => handleLinkClick(e, '#layanan')}
              className="hover:text-semesta transition-colors"
            >
              Layanan
            </a>
            <span>•</span>
            <a
              href="#kontak"
              onClick={(e) => handleLinkClick(e, '#kontak')}
              className="hover:text-semesta transition-colors"
            >
              Kontak
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                onNavigate('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-semesta transition-colors font-mono"
            >
              Tentang Saya
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
