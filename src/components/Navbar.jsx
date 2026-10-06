import { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import logoSvg from '../assets/logo.svg';

export default function Navbar({ currentView = 'home', onNavigate = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Karya', href: '/karya' },
    { name: 'Layanan', href: '/layanan' },
    { name: 'Tentang Saya', href: '/about' },
  ];

  const handleLinkClick = (e, href) => {
    if (href === '/karya') {
      e.preventDefault();
      onNavigate('karya');
      setIsOpen(false);
      window.scrollTo(0, 0);
    } else if (href === '/layanan') {
      e.preventDefault();
      onNavigate('layanan');
      setIsOpen(false);
      window.scrollTo(0, 0);
    } else if (href === '/about' || href === '#about') {
      e.preventDefault();
      onNavigate('about');
      setIsOpen(false);
      window.scrollTo(0, 0);
    } else if (href.startsWith('#')) {
      if (currentView === 'about' || currentView === 'karya' || currentView === 'layanan') {
        e.preventDefault();
        onNavigate('home', href);
        setIsOpen(false);
        setTimeout(() => {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setIsOpen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group py-1"
          >
            <img
              src={logoSvg}
              alt="sumestawsome Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-500 hover:rotate-180 group-hover:rotate-180 ease-in-out"
            />
            <span className="font-mono text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              sumestawsome
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isAboutLink = link.href === '/about' || link.href === '#about';
              const isKaryaLink = link.href === '/karya';
              const isLayananLink = link.href === '/layanan';
              const isActive =
                (isAboutLink && currentView === 'about') ||
                (isKaryaLink && currentView === 'karya') ||
                (isLayananLink && currentView === 'layanan');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary-light font-semibold border border-primary/20'
                      : 'text-slate-700 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
            <div className="pl-4">
              <a
                href="#kontak"
                onClick={(e) => {
                  if (currentView === 'about' || currentView === 'karya' || currentView === 'layanan') {
                    e.preventDefault();
                    onNavigate('home', '#kontak');
                    setTimeout(() => {
                      const el = document.getElementById('kontak');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors border border-primary"
              >
                <span>Hubungi</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 border border-slate-200 text-slate-700 hover:text-primary hover:border-slate-300 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Overlay Floating Dropdown) */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl z-50 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isAboutLink = link.href === '/about' || link.href === '#about';
            const isKaryaLink = link.href === '/karya';
            const isLayananLink = link.href === '/layanan';
            const isActive =
              (isAboutLink && currentView === 'about') ||
              (isKaryaLink && currentView === 'karya') ||
              (isLayananLink && currentView === 'layanan');
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`block px-3 py-2.5 text-base font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary-light font-semibold border-l-2 border-primary'
                    : 'text-slate-800 hover:bg-slate-50 hover:text-primary border-l-2 border-transparent hover:border-primary'
                }`}
              >
                {link.name}
              </a>
            );
          })}
          <div className="pt-2">
            <a
              href="#kontak"
              onClick={(e) => {
                setIsOpen(false);
                if (currentView === 'about' || currentView === 'karya' || currentView === 'layanan') {
                  e.preventDefault();
                  onNavigate('home', '#kontak');
                  setTimeout(() => {
                    const el = document.getElementById('kontak');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors border border-primary"
            >
              <span>Hubungi</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
