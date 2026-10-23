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
import Blog from './pages/frontpages/Blog';
import BlogDetail from './pages/frontpages/BlogDetail';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/karya' || hash === '#karya-gallery' || hash === '#karya-page') return 'karya';
      if (path === '/about' || hash === '#about') return 'about';
      if (path === '/layanan' || hash === '#layanan-page') return 'layanan';
      if (path === '/blog') return 'blog';
      if (path.startsWith('/blog/')) return 'blog-detail';
    }
    return 'home';
  });

  const [currentSlug, setCurrentSlug] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/blog/')) {
        return path.replace(/^\/blog\//, '').split('/')[0];
      }
    }
    return '';
  });

  const navigateTo = (view, targetParam) => {
    setCurrentView(view);
    if (view === 'karya') {
      window.history.pushState(null, '', '/karya');
    } else if (view === 'about') {
      window.history.pushState(null, '', '/about');
    } else if (view === 'layanan') {
      window.history.pushState(null, '', '/layanan');
    } else if (view === 'blog') {
      window.history.pushState(null, '', '/blog');
    } else if (view === 'blog-detail') {
      const slug = targetParam || '';
      setCurrentSlug(slug);
      window.history.pushState(null, '', `/blog/${slug}`);
    } else {
      window.history.pushState(null, '', '/' + (targetParam ? targetParam : ''));
    }
    window.scrollTo(0, 0);
  };

  // Otomatisasi scroll ke paling atas saat berganti halaman/rute
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, currentSlug]);

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
      } else if (path === '/blog') {
        setCurrentView('blog');
      } else if (path.startsWith('/blog/')) {
        const slug = path.replace(/^\/blog\//, '').split('/')[0];
        setCurrentSlug(slug);
        setCurrentView('blog-detail');
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-semesta/15 selection:text-semesta flex flex-col justify-between">
      <Navbar currentView={currentView} onNavigate={navigateTo} />
      <main className="flex-1">
        {currentView === 'karya' ? (
          <Karya onNavigate={navigateTo} />
        ) : currentView === 'about' ? (
          <About onNavigate={navigateTo} />
        ) : currentView === 'layanan' ? (
          <Layanan onNavigate={navigateTo} />
        ) : currentView === 'blog' ? (
          <Blog onNavigate={navigateTo} />
        ) : currentView === 'blog-detail' ? (
          <BlogDetail slug={currentSlug} onNavigate={navigateTo} />
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
