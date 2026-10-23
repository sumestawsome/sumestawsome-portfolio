import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { updateMetaTags } from '../../utils/seo';
import TableOfContents from '../../components/blog/TableOfContents';
import BlogSidebarCta from '../../components/blog/BlogSidebarCta';
import BlogCard from '../../components/blog/BlogCard';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  Share2,
  Check,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export default function BlogDetail({ slug, onNavigate = () => {} }) {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPostData() {
      if (!slug) {
        setError('Slug artikel tidak ditemukan.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      if (!isFirebaseConfigured || !db) {
        setError('Konfigurasi database belum tersedia.');
        setLoading(false);
        return;
      }

      try {
        // Ambil dokumen artikel
        let currentPost = null;
        const docRef = doc(db, 'posts', slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          currentPost = { id: docSnap.id, ...docSnap.data() };
        } else {
          // Fallback query berdasarkan field slug jika Document ID berbeda
          const qSlug = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
          const snapSlug = await getDocs(qSlug);
          if (!snapSlug.empty) {
            currentPost = { id: snapSlug.docs[0].id, ...snapSlug.docs[0].data() };
          }
        }

        if (!currentPost) {
          setError('Artikel yang Anda cari tidak ditemukan atau telah dihapus.');
          setLoading(false);
          return;
        }

        setPost(currentPost);

        // Ambil data untuk artikel terkait & periksa total artikel
        const allPublishedQuery = query(
          collection(db, 'posts'),
          where('status', '==', 'published')
        );
        const allSnap = await getDocs(allPublishedQuery);
        const allPosts = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Sesuai aturan: jika total artikel di Firestore <= 1, sembunyikan section artikel terkait
        if (allPosts.length > 1) {
          const related = allPosts
            .filter((p) => (p.slug || p.id) !== slug)
            .filter((p) => !currentPost.category || p.category === currentPost.category)
            .slice(0, 3);

          // Jika kategori sama tidak ada selain artikel ini, ambil artikel lain
          if (related.length === 0) {
            const fallbackRelated = allPosts
              .filter((p) => (p.slug || p.id) !== slug)
              .slice(0, 3);
            setRelatedPosts(fallbackRelated);
          } else {
            setRelatedPosts(related);
          }
        } else {
          setRelatedPosts([]);
        }
      } catch (err) {
        console.error('Error saat mengambil detail artikel:', err);
        setError('Terjadi kendala saat mengambil data artikel dari database.');
      } finally {
        setLoading(false);
      }
    }

    loadPostData();
  }, [slug]);

  // Update dynamic SEO & JSON-LD
  useEffect(() => {
    if (!post) return;

    const postUrl = `https://sumestawsome.xyz/blog/${post.slug}`;
    const coverUrl =
      post.coverImage?.url ||
      'https://firebasestorage.googleapis.com/v0/b/sumestawsome-blog.appspot.com/o/covers%2Fdeploy-vercel-guide.webp?alt=media';

    const breadcrumbSchema = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Beranda',
          item: 'https://sumestawsome.xyz',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://sumestawsome.xyz/blog',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.category || 'Artikel',
          item: `https://sumestawsome.xyz/blog`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: post.title,
          item: postUrl,
        },
      ],
    };

    const articleSchema = {
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: [coverUrl],
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.author?.name || 'Admin Sumesta',
        url: post.author?.url || 'https://sumestawsome.xyz',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Sumestawsome',
        url: 'https://sumestawsome.xyz',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl,
      },
    };

    const cleanup = updateMetaTags({
      title: post.seo?.metaTitle || `${post.title} | sumestawsome.xyz`,
      description: post.seo?.metaDescription || post.excerpt,
      canonical: post.seo?.canonicalUrl || postUrl,
      ogImage: coverUrl,
      ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [breadcrumbSchema, articleSchema],
      },
    });

    return cleanup;
  }, [post]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // State: Loading
  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-48 bg-zinc-200 animate-pulse rounded-none mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-10 bg-zinc-200 animate-pulse w-3/4 rounded-none" />
              <div className="h-4 bg-zinc-200 animate-pulse w-1/3 rounded-none" />
              <div className="aspect-[16/9] bg-zinc-200 animate-pulse rounded-none" />
              <div className="space-y-3 pt-6">
                <div className="h-4 bg-zinc-200 animate-pulse rounded-none" />
                <div className="h-4 bg-zinc-200 animate-pulse rounded-none" />
                <div className="h-4 bg-zinc-200 animate-pulse w-5/6 rounded-none" />
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="h-48 bg-zinc-200 animate-pulse rounded-none" />
              <div className="h-64 bg-zinc-200 animate-pulse rounded-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State: Error
  if (error || !post) {
    return (
      <div className="bg-slate-50 min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-2 border-semesta bg-white p-8 sm:p-12 text-center rounded-none">
            <AlertCircle className="w-12 h-12 text-semesta mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Artikel Tidak Ditemukan</h1>
            <p className="text-zinc-600 mb-6">{error || 'Data artikel tidak tersedia di sistem.'}</p>
            <button
              type="button"
              onClick={() => onNavigate('blog')}
              className="inline-flex items-center gap-2 bg-semesta hover:bg-semesta/90 text-white font-semibold py-2.5 px-6 rounded-none text-sm font-mono transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center flex-wrap gap-1.5 text-xs font-mono text-zinc-500"
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="hover:text-semesta transition-colors"
          >
            Beranda
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <a
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('blog');
            }}
            className="hover:text-semesta transition-colors"
          >
            Blog
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-700 font-medium">{post.category || 'Umum'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-semesta font-semibold truncate max-w-xs">{post.title}</span>
        </nav>

        {/* 2-Kolom Layout Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Kolom Konten Utama (8 Kolom) */}
          <div className="lg:col-span-8 bg-white border border-zinc-200 p-6 sm:p-10 rounded-none">
            {/* Header Artikel */}
            <header className="mb-8 border-b border-zinc-200 pb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-semesta/10 text-semesta border border-semesta/20 text-xs font-bold px-3 py-1 rounded-none font-mono uppercase tracking-wider">
                  {post.category || 'Teknologi'}
                </span>
                {post.isFeatured && (
                  <span className="bg-semesta text-white text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-none">
                    Unggulan
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 leading-tight mb-4">
                {post.title}
              </h1>

              {/* Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-zinc-500 font-mono border-t border-zinc-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {post.author?.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-none border border-zinc-300 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-semesta text-white text-xs font-bold flex items-center justify-center rounded-none">
                        {post.author?.name ? post.author.name[0] : 'S'}
                      </div>
                    )}
                    <span className="font-sans font-semibold text-zinc-800">
                      {post.author?.name || 'Admin Sumesta'}
                    </span>
                  </div>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-semesta" /> {formatDate(post.publishedAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-semesta" /> {post.readingTime || 5} mnt baca
                  </span>
                </div>

                {/* Bagikan Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-semesta transition-colors font-mono"
                  title="Salin tautan artikel"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Bagikan</span>
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Cover Image Utama */}
            {post.coverImage?.url && (
              <div className="mb-8 overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-none bg-zinc-100">
                <img
                  src={post.coverImage.url}
                  alt={post.coverImage.alt || post.title}
                  width={post.coverImage.width || 1200}
                  height={post.coverImage.height || 630}
                  className="w-full h-auto object-cover rounded-none"
                  loading="eager"
                />
              </div>
            )}

            {/* Render Markdown Konten */}
            <div className="blog-content font-sans">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => {
                    const raw = Array.isArray(children)
                      ? children.join('')
                      : typeof children === 'string'
                      ? children
                      : '';
                    const id = raw
                      .replace(/[*_`]/g, '')
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    return (
                      <h2
                        id={id}
                        className="text-2xl font-bold mt-10 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 scroll-mt-24 tracking-tight"
                      >
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ children }) => {
                    const raw = Array.isArray(children)
                      ? children.join('')
                      : typeof children === 'string'
                      ? children
                      : '';
                    const id = raw
                      .replace(/[*_`]/g, '')
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    return (
                      <h3
                        id={id}
                        className="text-xl font-semibold mt-6 mb-3 text-zinc-900 scroll-mt-24 tracking-tight"
                      >
                        {children}
                      </h3>
                    );
                  },
                  p: ({ children }) => (
                    <p className="text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 mb-6 font-normal">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-2 mb-6 marker:text-semesta">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-2 mb-6 marker:text-semesta">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-zinc-700 leading-relaxed text-base sm:text-lg">
                      {children}
                    </li>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-none border border-zinc-800 font-mono text-sm overflow-x-auto my-6">
                      {children}
                    </pre>
                  ),
                  code: ({ inline, children, ...props }) => {
                    if (inline || !String(children).includes('\n')) {
                      return (
                        <code
                          className="bg-zinc-100 dark:bg-zinc-800 text-semesta font-mono text-xs px-1.5 py-0.5 rounded-none border border-zinc-300 dark:border-zinc-700"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="font-mono text-sm block" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-semesta underline underline-offset-4 hover:opacity-80 font-medium"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-semesta pl-4 py-2 italic my-6 text-zinc-600 bg-zinc-50 rounded-none">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border border-zinc-200">
                      <table className="w-full border-collapse text-sm text-left">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-zinc-200 p-3 bg-zinc-100 font-bold text-zinc-900">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-zinc-200 p-3 text-zinc-700">{children}</td>
                  ),
                  hr: () => <hr className="border-t border-zinc-200 my-8" />,
                }}
              >
                {post.content || ''}
              </ReactMarkdown>
            </div>

            {/* Author Box */}
            <div className="mt-12 pt-8 border-t border-zinc-200">
              <div className="border border-zinc-200 bg-zinc-50 p-6 rounded-none flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-16 h-16 rounded-none border border-zinc-300 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-semesta text-white text-2xl font-bold flex items-center justify-center rounded-none flex-shrink-0">
                    {post.author?.name ? post.author.name[0] : 'S'}
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="font-bold text-base text-zinc-900">
                      {post.author?.name || 'Admin Sumesta'}
                    </span>
                    <span className="text-[10px] bg-semesta/10 text-semesta border border-semesta/20 px-2 py-0.5 rounded-none font-mono">
                      Penulis
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 mb-3">
                    {post.author?.bio || 'Full-stack developer & tech enthusiast.'}
                  </p>
                  <a
                    href={post.author?.url || 'https://sumestawsome.xyz'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-semesta hover:underline underline-offset-4 font-semibold"
                  >
                    Kunjungi Profil Portofolio &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Artikel Terkait (Otomatis tersembunyi jika total artikel <= 1) */}
            {relatedPosts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-zinc-200">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-4 h-4 text-semesta" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Artikel Terkait Lainnya
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((rel) => (
                    <BlogCard key={rel.slug || rel.id} post={rel} onNavigate={onNavigate} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kolom Sidebar Kanan (4 Kolom, Sticky) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-6">
            {/* 1. Table of Contents Otomatis */}
            <TableOfContents markdown={post.content || ''} />

            {/* 2. CTA Layanan Portofolio Sumestawsome */}
            <BlogSidebarCta onNavigate={onNavigate} />
          </aside>
        </div>
      </div>
    </article>
  );
}
