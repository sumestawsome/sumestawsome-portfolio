import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc, increment } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { updateMetaTags } from '../../utils/seo';
import { slugify, getNodeText } from '../../utils/slugify';
import TableOfContents, { extractHeadings } from '../../components/blog/TableOfContents';
import BlogSidebarCta from '../../components/blog/BlogSidebarCta';
import BlogCard from '../../components/blog/BlogCard';
import CodeBlock from '../../components/blog/CodeBlock';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Share2,
  Check,
  AlertCircle,
  BookOpen,
  AlignLeft,
  Eye,
  FileCode,
  Link2,
} from 'lucide-react';

export default function BlogDetail({ slug, onNavigate = () => {} }) {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState(null);
  const shareRef = useRef(null);

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
        const initialViews = typeof currentPost.views === 'number' ? currentPost.views : 0;
        setViewsCount(initialViews);

        // Pencatatan tayangan otomatis dengan deduplikasi sessionStorage
        const sessionKey = `viewed_post_${slug}`;
        if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
          try {
            sessionStorage.setItem(sessionKey, '1');
            const targetDocId = currentPost.id || slug;
            const postDocRef = doc(db, 'posts', targetDocId);
            updateDoc(postDocRef, {
              views: increment(1),
            })
              .then(() => {
                setViewsCount((prev) => prev + 1);
              })
              .catch((err) => {
                console.warn('Catatan view counter Firestore:', err.message);
              });
          } catch (storageErr) {
            console.warn('SessionStorage tidak tersedia:', storageErr);
          }
        }

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

    const defaultCover =
      'https://firebasestorage.googleapis.com/v0/b/sumestawsome-blog.appspot.com/o/covers%2Fdeploy-vercel-guide.webp?alt=media';
    const coverUrl =
      post.coverImage?.url ||
      (typeof post.coverImage === 'string' && post.coverImage.trim() ? post.coverImage : null) ||
      defaultCover;

    const postSlug = post.slug || post.id || '';
    const postUrl = `https://sumestawsome.xyz/blog/${postSlug}`;

    // Hirarki fallback SEO:
    // 1. Title: post.seo?.metaTitle || post.metaTitle || (post.title ? `${post.title} | Sumestawsome` : 'Artikel Blog Sumestawsome')
    const finalTitle =
      post.seo?.metaTitle ||
      post.metaTitle ||
      (post.title ? `${post.title} | Sumestawsome` : 'Artikel Blog Sumestawsome');

    // 2. Description: post.seo?.metaDescription || post.metaDescription || post.excerpt || 'Baca artikel teknologi dan panduan komputasi di Sumestawsome.'
    const finalDescription =
      post.seo?.metaDescription ||
      post.metaDescription ||
      post.excerpt ||
      'Baca artikel teknologi dan panduan komputasi di Sumestawsome.';

    // 3. Canonical: post.seo?.canonicalUrl || post.canonicalUrl || postUrl
    const finalCanonical =
      post.seo?.canonicalUrl ||
      post.canonicalUrl ||
      postUrl;

    // 4. Keywords
    const finalKeywords =
      post.seo?.keywords ||
      post.keywords ||
      (Array.isArray(post.tags) ? post.tags : []);

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
          item: 'https://sumestawsome.xyz/blog',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: post.title,
          item: finalCanonical,
        },
      ],
    };

    const articleSchema = {
      '@type': 'BlogPosting',
      headline: post.title,
      description: finalDescription,
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
        '@id': finalCanonical,
      },
    };

    const cleanup = updateMetaTags({
      title: finalTitle,
      description: finalDescription,
      canonical: finalCanonical,
      ogImage: coverUrl,
      ogType: 'article',
      keywords: finalKeywords,
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

  // Close share menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShareOpen(false);
      }
    }
    if (shareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shareOpen]);

  const getArticleUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://sumestawsome.xyz/blog/${post?.slug || ''}`;
  };

  const getShareText = () => {
    return `${post?.title || 'Artikel Blog Sumestawsome'} oleh Putu Agus Sumerta`;
  };

  const handleShareWhatsApp = () => {
    const url = getArticleUrl();
    const text = getShareText();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  const handleShareLinkedIn = () => {
    const url = getArticleUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  const handleShareX = () => {
    const url = getArticleUrl();
    const text = getShareText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  const handleShareFacebook = () => {
    const url = getArticleUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  const handleShareInstagram = async () => {
    const url = getArticleUrl();
    const text = `${post?.title}\n${post?.excerpt || ''}\n${url}`;

    // Jalur mobile via Web Share API
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
    if (isMobile && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || post?.title,
          url: url,
        });
        setShareOpen(false);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('Gagal memicu navigator.share:', err);
      }
    }

    // Jalur desktop & fallback: salin teks dan link, lalu buka Instagram
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setShareNotice('Teks & link tersalin! Tempel di Postingan/Story IG');
        setTimeout(() => {
          window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
          setTimeout(() => setShareNotice(null), 3000);
        }, 800);
      } catch {
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      }
    } else {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLinkOnly = async () => {
    const url = getArticleUrl();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareNotice('Tautan Tersalin!');
      setTimeout(() => {
        setShareNotice(null);
        setShareOpen(false);
      }, 1500);
    }
  };

  const handleCopyMarkdown = () => {
    if (!post || typeof window === 'undefined') return;

    const authorName = post.author?.name || (typeof post.author === 'string' ? post.author : 'Putu Agus Sumerta Yasa');
    const postCategory = post.category || 'Umum';
    const postDate = formatDate(post.publishedAt) || formatDate(new Date().toISOString());
    const postSlug = post.slug || slug || '';
    const postUrl = `https://sumestawsome.xyz/blog/${postSlug}`;
    const excerptText = post.excerpt ? `${post.excerpt.trim()}\n\n` : '';
    const contentText = (post.content || '').trim();

    const markdownText = `# ${post.title}

- Penulis: ${authorName}
- Kategori: ${postCategory}
- Tanggal: ${postDate}
- Sumber: ${postUrl}

${excerptText}---

${contentText}
`;

    navigator.clipboard.writeText(markdownText).then(() => {
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    }).catch((err) => {
      console.error('Gagal menyalin markdown:', err);
    });
  };

  const headings = extractHeadings(post?.content || '');

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
    <article className="bg-slate-50 min-h-screen py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation & Salin Markdown */}
        <div className="mb-6 sm:mb-8 px-4 sm:px-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Sisi Kiri: Breadcrumb */}
          <div className="flex items-center">
            {/* Mobile Breadcrumb (< sm) */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => onNavigate('blog')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-semesta transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Blog</span>
              </button>
            </div>

            {/* Desktop/Tablet Breadcrumb (>= sm) */}
            <nav
              aria-label="Breadcrumb"
              className="hidden sm:flex items-center flex-wrap gap-1.5 text-xs font-mono text-zinc-500"
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
          </div>

          {/* Sisi Kanan: Tombol Salin Markdown Sejajar di Atas Sidebar Daftar Isi */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono transition-colors rounded-none border shadow-none self-start sm:self-auto ${
              copiedMarkdown
                ? 'border-semesta text-semesta bg-semesta/5 font-bold'
                : 'border-zinc-300 dark:border-zinc-700 bg-white text-zinc-700 hover:border-semesta hover:text-semesta'
            }`}
            title="Salin seluruh konten artikel dalam format Markdown bersih"
          >
            {copiedMarkdown ? (
              <>
                <Check className="w-3.5 h-3.5 text-semesta" />
                <span>Tersalin (.md)!</span>
              </>
            ) : (
              <>
                <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                <span>Salin Markdown</span>
              </>
            )}
          </button>
        </div>

        {/* 2-Kolom Layout Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Kolom Konten Utama (8 Kolom) */}
          <div className="lg:col-span-8 bg-white border-y sm:border border-zinc-200 dark:border-zinc-800 px-4 py-6 sm:p-8 lg:p-10 rounded-none">
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
                    {post.author?.avatar || post.authorAvatar ? (
                      <img
                        src={post.author?.avatar || post.authorAvatar}
                        alt={post.author?.name || (typeof post.author === 'string' ? post.author : 'Admin Sumesta')}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          const authorName = post.author?.name || (typeof post.author === 'string' ? post.author : 'Admin');
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=2563eb&color=fff&bold=true`;
                        }}
                        className="w-6 h-6 rounded-none border border-zinc-300 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-semesta text-white text-xs font-bold flex items-center justify-center rounded-none">
                        {post.author?.name ? post.author.name[0] : (typeof post.author === 'string' ? post.author[0] : 'S')}
                      </div>
                    )}
                    <span className="font-sans font-semibold text-zinc-800">
                      {post.author?.name || (typeof post.author === 'string' ? post.author : 'Admin Sumesta')}
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
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-semesta" /> {viewsCount || post.views || 0} kali dilihat
                  </span>
                </div>

                {/* Popover Menu Bagikan Lengkap */}
                <div className="relative" ref={shareRef}>
                  <button
                    type="button"
                    onClick={() => setShareOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-semesta transition-colors font-mono px-2.5 py-1 rounded-none border border-zinc-200 hover:border-semesta shadow-none text-xs"
                    title="Buka opsi berbagi artikel"
                    aria-expanded={shareOpen}
                  >
                    <Share2 className="w-3.5 h-3.5 text-semesta" />
                    <span>Bagikan</span>
                    <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${shareOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Panel Berbagi */}
                  {shareOpen && (
                    <div className="absolute right-0 top-full mt-2 z-30 w-64 bg-white border border-zinc-300 dark:border-zinc-700 rounded-none shadow-none p-2 animate-cascade-down">
                      <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 border-b border-zinc-100 mb-1 flex items-center justify-between">
                        <span>Bagikan Artikel</span>
                        <Share2 className="w-3 h-3 text-zinc-400" />
                      </div>

                      {shareNotice && (
                        <div className="bg-semesta/10 border border-semesta text-semesta text-[11px] font-mono px-2 py-1.5 mb-2 rounded-none flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-semesta flex-shrink-0" />
                          <span>{shareNotice}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        {/* 1. WhatsApp */}
                        <button
                          type="button"
                          onClick={handleShareWhatsApp}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors rounded-none border border-transparent hover:border-emerald-200 text-left"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.08s.89 2.42 1.01 2.59c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3" />
                            </svg>
                            <span>WhatsApp</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Chat & Status</span>
                        </button>

                        {/* 2. Instagram */}
                        <button
                          type="button"
                          onClick={handleShareInstagram}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-zinc-700 hover:bg-pink-50 hover:text-pink-700 transition-colors rounded-none border border-transparent hover:border-pink-200 text-left"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="2" width="20" height="20" rx="0" ry="0" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                            <span>Instagram</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Feed & Story</span>
                        </button>

                        {/* 3. LinkedIn */}
                        <button
                          type="button"
                          onClick={handleShareLinkedIn}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-none border border-transparent hover:border-blue-200 text-left"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.67-.75 1.67-1.67a1.67 1.67 0 0 0-3.34 0c0 .92.75 1.67 1.67 1.67m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                            </svg>
                            <span>LinkedIn</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Post</span>
                        </button>

                        {/* 4. X (Twitter) */}
                        <button
                          type="button"
                          onClick={handleShareX}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors rounded-none border border-transparent hover:border-zinc-300 text-left"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-zinc-900" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span>X (Twitter)</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Tweet</span>
                        </button>

                        {/* 5. Facebook */}
                        <button
                          type="button"
                          onClick={handleShareFacebook}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-zinc-700 hover:bg-blue-50 hover:text-blue-800 transition-colors rounded-none border border-transparent hover:border-blue-200 text-left"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span>Facebook</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Share</span>
                        </button>

                        {/* 6. Salin Tautan */}
                        <button
                          type="button"
                          onClick={handleCopyLinkOnly}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-zinc-700 hover:bg-semesta/10 hover:text-semesta transition-colors rounded-none border border-transparent hover:border-semesta/30 text-left pt-2 border-t border-zinc-100"
                        >
                          <span className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-semesta" />
                            <span>Salin Tautan</span>
                          </span>
                          <span className="text-[10px] text-semesta font-semibold">URL</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Cover Image Utama */}
            {(post.coverImage?.url || (typeof post.coverImage === 'string' && post.coverImage)) && (
              <div className="mb-8 overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-none bg-zinc-100">
                <img
                  src={post.coverImage?.url || post.coverImage}
                  alt={post.coverImage?.alt || post.title}
                  width={post.coverImage?.width || 1200}
                  height={post.coverImage?.height || 630}
                  className="w-full h-auto object-cover rounded-none"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder-blog.svg';
                  }}
                />
              </div>
            )}

            {/* Mobile Table of Contents Accordion (Hanya tampil di mobile < lg) */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-none overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileTocOpen(!mobileTocOpen)}
                  className="w-full flex items-center justify-between p-4 text-left font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
                  aria-expanded={mobileTocOpen}
                >
                  <span className="flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-semesta" />
                    <span>Daftar Isi Artikel</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                      mobileTocOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {mobileTocOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <ul className="space-y-2 text-xs font-mono">
                      {headings.map(({ level, text, id }) => (
                        <li key={id} className={level === 3 ? 'pl-3' : ''}>
                          <a
                            href={`#${id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setMobileTocOpen(false);
                              const el = document.getElementById(id);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                                window.history.replaceState(null, '', `#${id}`);
                              }
                            }}
                            className="block text-zinc-700 dark:text-zinc-300 hover:text-semesta py-0.5"
                          >
                            {text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Render Markdown Konten */}
            <div className="blog-content font-sans max-w-full overflow-hidden break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => {
                    const text = getNodeText(children);
                    const id = slugify(text);
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
                    const text = getNodeText(children);
                    const id = slugify(text);
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
                  pre: ({ children }) => <>{children}</>,
                  code: ({ inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const isMultiLine = codeString.includes('\n');

                    if (!inline && (match || isMultiLine)) {
                      return (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          code={codeString}
                          {...props}
                        />
                      );
                    }

                    return (
                      <code
                        className="bg-zinc-200/75 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-normal text-[0.9em] px-1.5 py-0.5 rounded-none border-0 shadow-none break-words before:content-none after:content-none"
                        {...props}
                      >
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
                {post.author?.avatar || post.authorAvatar ? (
                  <img
                    src={post.author?.avatar || post.authorAvatar}
                    alt={post.author?.name || (typeof post.author === 'string' ? post.author : 'Admin Sumesta')}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      const authorName = post.author?.name || (typeof post.author === 'string' ? post.author : 'Admin');
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=2563eb&color=fff&bold=true`;
                    }}
                    className="w-16 h-16 rounded-none border border-zinc-300 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-semesta text-white text-2xl font-bold flex items-center justify-center rounded-none flex-shrink-0">
                    {post.author?.name ? post.author.name[0] : (typeof post.author === 'string' ? post.author[0] : 'S')}
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="font-bold text-base text-zinc-900">
                      {post.author?.name || (typeof post.author === 'string' ? post.author : 'Admin Sumesta')}
                    </span>
                    <span className="text-[10px] bg-semesta/10 text-semesta border border-semesta/20 px-2 py-0.5 rounded-none font-mono">
                      Penulis
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 mb-3">
                    {post.author?.bio || post.authorRole || 'Full-stack developer & tech enthusiast.'}
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
          <aside className="lg:col-span-4 sticky top-24 space-y-6 px-4 sm:px-0">
            {/* 1. Table of Contents Otomatis (Hidden di mobile agar tidak duplikat dengan accordion) */}
            <div className="hidden lg:block">
              <TableOfContents markdown={post.content || ''} />
            </div>

            {/* 2. CTA Layanan Portofolio Sumestawsome */}
            <BlogSidebarCta onNavigate={onNavigate} />
          </aside>
        </div>
      </div>
    </article>
  );
}
