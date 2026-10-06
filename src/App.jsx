import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MetricBar from './components/MetricBar';
import Showcase from './components/Showcase';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
import About from './pages/About';
import Karya from './pages/frontpages/Karya';
import Layanan from './pages/frontpages/Layanan';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/karya' || hash === '#karya-gallery' || hash === '#karya-page') return 'karya';
      if (path === '/about' || hash === '#about') return 'about';
      if (path === '/layanan' || hash === '#layanan-page') return 'layanan';
    }
    return 'home';
  });

  const navigateTo = (view, targetHash) => {
    setCurrentView(view);
    if (view === 'karya') {
      window.history.pushState(null, '', '/karya');
    } else if (view === 'about') {
      window.history.pushState(null, '', '/about');
    } else if (view === 'layanan') {
      window.history.pushState(null, '', '/layanan');
    } else {
      window.history.pushState(null, '', '/' + (targetHash ? targetHash : ''));
    }
    window.scrollTo(0, 0);
  };

  // Otomatisasi scroll ke paling atas saat berganti halaman/rute
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/karya' || hash === '#karya-gallery') {
        setCurrentView('karya');
      } else if (path === '/about' || hash === '#about') {
        setCurrentView('about');
      } else if (path === '/layanan' || hash === '#layanan-page') {
        setCurrentView('layanan');
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-light selection:text-primary flex flex-col justify-between">
      <Navbar currentView={currentView} onNavigate={navigateTo} />
      <main className="flex-1">
        {currentView === 'karya' ? (
          <Karya onNavigate={navigateTo} />
        ) : currentView === 'about' ? (
          <About onNavigate={navigateTo} />
        ) : currentView === 'layanan' ? (
          <Layanan onNavigate={navigateTo} />
        ) : (
          <>
            <Hero />
            <MetricBar />
            <Showcase />
            <Services />
            <Contact />
          </>
        )}
      </main>
      <Footer currentView={currentView} onNavigate={navigateTo} />
    </div>
  );
}
