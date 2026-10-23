import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { updateMetaTags } from '../../utils/seo';
import BlogCard from '../../components/blog/BlogCard';
import { BookOpen, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function Blog({ onNavigate = () => {} }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  useEffect(() => {
    const cleanup = updateMetaTags({
      title: 'Blog & Catatan Rekayasa Web | sumestawsome.xyz',
      description:
        'Kumpulan artikel praktis, wawasan arsitektur web modern, deployment, dan desain visual presisi dari Sumestawsome.',
      canonical: 'https://sumestawsome.xyz/blog',
      ogType: 'website',
    });
    return cleanup;
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    if (!isFirebaseConfigured || !db) {
      setError('Konfigurasi Firebase belum aktif di .env.local.');
      setLoading(false);
      return;
    }

    try {
      let fetchedPosts = [];
      try {
        // Query utama dengan order server-side
        const q = query(
          collection(db, 'posts'),
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (queryErr) {
        // Fallback jika Firestore belum memiliki composite index
        console.warn('Menggunakan pengurutan memori lokal:', queryErr.message);
        const qFallback = query(collection(db, 'posts'), where('status', '==', 'published'));
        const snapshot = await getDocs(qFallback);
        fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        fetchedPosts.sort(
          (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
        );
      }

      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Gagal memuat artikel blog:', err);
      setError('Gagal memuat daftar artikel dari database. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Ekstrak kategori unik
  const categories = ['Semua', ...new Set(posts.map((p) => p.category).filter(Boolean))];

  // Filter berdasarkan kategori yang dipilih
  const filteredPosts =
    selectedCategory === 'Semua'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  // Artikel unggulan (isFeatured: true)
  const featuredPost =
    filteredPosts.find((p) => p.isFeatured) || (filteredPosts.length > 0 ? filteredPosts[0] : null);

  // Artikel grid reguler (mengecualikan artikel unggulan jika sedang ditampilkan di atas)
  const regularPosts = featuredPost
    ? filteredPosts.filter((p) => p.id !== featuredPost.id && p.slug !== featuredPost.slug)
    : filteredPosts;

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Seksi */}
        <div className="mb-12 border-b border-zinc-200 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 bg-semesta inline-block" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-semesta flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Publikasi & Tulisan
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
                Wawasan & Rekayasa Web
              </h1>
              <p className="mt-2 text-base text-zinc-600 max-w-2xl font-normal">
                Dokumentasi solusi teknis, eksplorasi desain frontend, panduan deployment, dan
                arsitektur perangkat lunak.
              </p>
            </div>

            {/* Kategori Filter Tabs */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors rounded-none border ${
                      selectedCategory === cat
                        ? 'bg-semesta text-white border-semesta font-bold'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-semesta hover:text-semesta'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* State: Loading */}
        {loading && (
          <div className="space-y-6">
            <div className="border border-zinc-200 bg-white p-8 aspect-[21/9] animate-pulse rounded-none flex flex-col justify-end">
              <div className="h-6 bg-zinc-200 w-1/4 mb-3" />
              <div className="h-8 bg-zinc-200 w-3/4 mb-2" />
              <div className="h-4 bg-zinc-200 w-1/2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-zinc-200 bg-white p-5 h-80 animate-pulse rounded-none"
                >
                  <div className="h-40 bg-zinc-200 mb-4" />
                  <div className="h-4 bg-zinc-200 w-1/3 mb-2" />
                  <div className="h-6 bg-zinc-200 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State: Error */}
        {!loading && error && (
          <div className="border-2 border-red-500 bg-red-50 p-6 rounded-none text-red-900 mb-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1">Gagal Menghubungkan ke Database</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchPosts}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors rounded-none font-mono"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Coba Muat Ulang
              </button>
            </div>
          </div>
        )}

        {/* State: Empty */}
        {!loading && !error && posts.length === 0 && (
          <div className="border border-zinc-200 bg-white p-12 text-center rounded-none my-8">
            <BookOpen className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Belum Ada Artikel yang Dipublikasikan</h3>
            <p className="text-sm text-zinc-600 max-w-md mx-auto">
              Saat ini belum ada dokumen di koleksi Firestore dengan status "published". Data artikel yang
              diunggah akan otomatis muncul di sini.
            </p>
          </div>
        )}

        {/* State: Success */}
        {!loading && !error && posts.length > 0 && (
          <div>
            {/* Artikel Unggulan (Baris Paling Atas) */}
            {featuredPost && (
              <BlogCard
                post={featuredPost}
                onNavigate={onNavigate}
                isFeatured={true}
              />
            )}

            {/* Grid Artikel Reguler */}
            {regularPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-200">
                  <Sparkles className="w-4 h-4 text-semesta" />
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Semua Artikel Terbaru ({regularPosts.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {regularPosts.map((post) => (
                    <BlogCard key={post.slug || post.id} post={post} onNavigate={onNavigate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
