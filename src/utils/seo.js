const DEFAULT_OG_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/sumestawsome-blog.appspot.com/o/covers%2Fdeploy-vercel-guide.webp?alt=media';

/**
 * Utility untuk mengelola metadata head secara dinamis (SEO & OpenGraph).
 */
export function updateMetaTags({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'article',
  keywords = null,
  jsonLd = null,
}) {
  if (typeof document === 'undefined') return () => {};

  const prevTitle = document.title;

  if (title) {
    document.title = title;
  }

  // Helper untuk set/create tag meta
  const setMeta = (name, content, isProperty = false) => {
    if (!content) return;
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Helper untuk canonical link
  const setCanonical = (href) => {
    if (!href) return;
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  // Selalu pasang identitas situs & Twitter Card summary_large_image
  setMeta('og:site_name', 'Sumestawsome', true);
  setMeta('twitter:card', 'summary_large_image');

  if (description) {
    setMeta('description', description);
    setMeta('og:description', description, true);
    setMeta('twitter:description', description);
  }

  if (title) {
    setMeta('og:title', title, true);
    setMeta('twitter:title', title);
  }

  if (canonical) {
    setCanonical(canonical);
    setMeta('og:url', canonical, true);
  }

  if (ogType) {
    setMeta('og:type', ogType, true);
  }

  const finalOgImage = ogImage || DEFAULT_OG_IMAGE;
  if (finalOgImage) {
    setMeta('og:image', finalOgImage, true);
    setMeta('twitter:image', finalOgImage);
  }

  if (keywords) {
    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : String(keywords);
    if (keywordsStr.trim()) {
      setMeta('keywords', keywordsStr.trim());
    }
  }

  // Schema JSON-LD
  let scriptEl = document.getElementById('dynamic-seo-schema');
  if (jsonLd) {
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'dynamic-seo-schema';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);
  } else if (scriptEl) {
    scriptEl.remove();
  }

  // Cleanup handler
  return () => {
    document.title = prevTitle;
    const activeScript = document.getElementById('dynamic-seo-schema');
    if (activeScript) activeScript.remove();
  };
}
