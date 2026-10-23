import { useState, useEffect } from 'react';
import { AlignLeft } from 'lucide-react';
import { slugify } from '../../utils/slugify';

/**
 * Ekstraksi heading ## (H2) dan ### (H3) dari string markdown
 */
export function extractHeadings(markdown) {
  if (!markdown) return [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // 2 untuk H2, 3 untuk H3
    const rawText = match[2].trim();
    const text = rawText.replace(/[*_`]/g, '').trim();
    const id = slugify(rawText);
    if (id) {
      headings.push({ level, text, id });
    }
  }
  return headings;
}

export default function TableOfContents({ markdown = '', className = '' }) {
  const headings = extractHeadings(markdown);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <nav
      aria-label="Daftar Isi Artikel"
      className={`border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-none ${className}`}
    >
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-200 dark:border-zinc-800">
        <AlignLeft className="w-4 h-4 text-semesta" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          Daftar Isi
        </span>
      </div>

      <ul className="space-y-1.5 text-sm">
        {headings.map(({ level, text, id }) => {
          const isActive = activeId === id;
          return (
            <li key={id} className={level === 3 ? 'pl-3' : ''}>
              <a
                href={`#${id}`}
                onClick={(e) => handleScrollTo(e, id)}
                className={`block py-1 pl-3 transition-colors text-xs sm:text-sm rounded-none border-l-2 ${
                  isActive
                    ? 'border-semesta text-semesta font-semibold bg-semesta/5'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-semesta hover:border-semesta/40'
                }`}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
