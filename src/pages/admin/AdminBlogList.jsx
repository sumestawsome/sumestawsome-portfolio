import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  TrendingUp,
  Share2,
  Smartphone,
  Monitor,
} from 'lucide-react';

export default function AdminBlogList({ onNavigate = () => {} }) {
  const [posts, setPosts] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingViews, setLoadingViews] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'views'

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);

    if (!isFirebaseConfigured || !db) {
      setError('Firebase Firestore belum terhubung.');
      setLoading(false);
      return;
    }

    try {
      const snap = await getDocs(collection(db, 'posts'));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Urutkan artikel terbaru di atas secara default
      list.sort((a, b) => new Date(b.publishedAt || b.updatedAt || 0) - new Date(a.publishedAt || a.updatedAt || 0));
      setPosts(list);
    } catch (err) {
      console.error('Gagal mengambil daftar artikel admin:', err);
      setError('Gagal memuat artikel dari database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentViews = async () => {
    if (!isFirebaseConfigured || !db) return;
    setLoadingViews(true);
    try {
      const sevenDaysAgo = Timestamp.fromDate(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      const qViews = query(
        collection(db, 'post_views'),
        where('viewedAt', '>=', sevenDaysAgo)
      );
      const snap = await getDocs(qViews);
      const viewsList = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setRecentViews(viewsList);
    } catch (err) {
      console.warn('Catatan post_views Firestore (mungkin belum ada indeks atau data):', err.message);
      setRecentViews([]);
    } finally {
      setLoadingViews(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchRecentViews();
  }, []);

  const handleReload = () => {
    fetchArticles();
    fetchRecentViews();
  };

  // Toggle status artikel (published <-> draft)
  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    setActionLoadingId(post.id);
    try {
      const docRef = doc(db, 'posts', post.slug || post.id);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setPosts((prev) =>
        prev.map((item) =>
          item.id === post.id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle artikel unggulan (isFeatured true <-> false)
  const handleToggleFeatured = async (post) => {
    const newFeatured = !post.isFeatured;
    setActionLoadingId(post.id);
    try {
      const docRef = doc(db, 'posts', post.slug || post.id);
      await updateDoc(docRef, {
        isFeatured: newFeatured,
        updatedAt: new Date().toISOString(),
      });
      setPosts((prev) =>
        prev.map((item) =>
          item.id === post.id ? { ...item, isFeatured: newFeatured } : item
        )
      );
    } catch (err) {
      alert('Gagal memperbarui status unggulan: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Hapus artikel dengan konfirmasi
  const handleDelete = async (post) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus artikel "${post.title}"?\nTindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmDelete) return;

    setActionLoadingId(post.id);
    try {
      const docRef = doc(db, 'posts', post.slug || post.id);
      await deleteDoc(docRef);
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
    } catch (err) {
      alert('Gagal menghapus artikel: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (p.title || '').toLowerCase().includes(q);
    const categoryMatch = (p.category || '').toLowerCase().includes(q);
    const slugMatch = (p.slug || '').toLowerCase().includes(q);
    return titleMatch || categoryMatch || slugMatch;
  });

  const displayedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.publishedAt || b.updatedAt || 0) - new Date(a.publishedAt || a.updatedAt || 0);
  });

  const totalPublished = posts.filter((p) => p.status === 'published').length;
  const totalDraft = posts.filter((p) => p.status === 'draft').length;
  const totalFeatured = posts.filter((p) => p.isFeatured).length;
  const totalViews = posts.reduce((sum, p) => sum + (typeof p.views === 'number' ? p.views : 0), 0);
  const total7DayViews = recentViews.length;

  // Analitik Artikel Terpopuler 7 Hari Terakhir
  const articleViewsMap = {};
  recentViews.forEach((v) => {
    const key = v.slug || v.postId || v.title || 'untitled';
    if (!articleViewsMap[key]) {
      const matchedPost = posts.find((p) => (p.slug || p.id) === key || p.id === v.postId);
      articleViewsMap[key] = {
        key,
        title: matchedPost?.title || v.title || key,
        category: matchedPost?.category || v.category || 'Umum',
        slug: matchedPost?.slug || v.slug || key,
        count: 0,
      };
    }
    articleViewsMap[key].count += 1;
  });

  const topArticles7Days = Object.values(articleViewsMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxArticleViews = topArticles7Days.length > 0 ? topArticles7Days[0].count : 1;

  // Analitik Platform / Sumber Rujukan 7 Hari Terakhir
  const platformViewsMap = {};
  recentViews.forEach((v) => {
    const src = v.source || 'Direct / Langsung';
    platformViewsMap[src] = (platformViewsMap[src] || 0) + 1;
  });

  const platforms7Days = Object.entries(platformViewsMap)
    .map(([name, count]) => ({
      name,
      count,
      pct: total7DayViews > 0 ? Math.round((count / total7DayViews) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const maxPlatformViews = platforms7Days.length > 0 ? platforms7Days[0].count : 1;

  // Perbandingan Perangkat (Mobile vs Desktop)
  const mobileViewsCount = recentViews.filter((v) => v.device === 'Mobile').length;
  const desktopViewsCount = recentViews.filter((v) => v.device === 'Desktop' || !v.device).length;
  const mobilePct = total7DayViews > 0 ? Math.round((mobileViewsCount / total7DayViews) * 100) : 0;
  const desktopPct = total7DayViews > 0 ? 100 - mobilePct : 0;

  return (
    <AdminLayout currentAdminView="blog-list" onNavigate={onNavigate}>
      {/* Top Bar / Stats */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Manajemen Artikel Blog
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 font-mono">
            Kelola publikasi, status rilis, dan sorotan artikel sumestawsome.xyz.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('admin-blog-create')}
          className="bg-semesta hover:bg-semesta/90 text-white font-semibold py-2.5 px-4 rounded-none text-xs sm:text-sm font-mono flex items-center justify-center gap-2 transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Artikel Baru</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-none">
          <span className="text-zinc-400 text-xs font-mono block">Total Artikel</span>
          <span className="text-2xl font-bold text-white font-mono">{posts.length}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-none">
          <span className="text-zinc-400 text-xs font-mono block">Published</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">{totalPublished}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-none">
          <span className="text-zinc-400 text-xs font-mono block">Draft</span>
          <span className="text-2xl font-bold text-amber-400 font-mono">{totalDraft}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-none">
          <span className="text-zinc-400 text-xs font-mono block">Unggulan</span>
          <span className="text-2xl font-bold text-semesta font-mono">{totalFeatured}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-none">
          <span className="text-zinc-400 text-xs font-mono block">Total Views</span>
          <span className="text-2xl font-bold text-purple-400 font-mono">{totalViews}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-none">
          <span className="text-zinc-400 text-xs font-mono block">Views 7 Hari</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono">{total7DayViews}</span>
        </div>
      </div>

      {/* 2-Column Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Panel Kiri: Artikel Dikunjungi (7 Hari Terakhir) */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-semesta" />
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Artikel Dikunjungi (7 Hari Terakhir)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {total7DayViews} tayangan
              </span>
            </div>

            {loadingViews ? (
              <div className="py-8 text-center text-zinc-500 font-mono text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-semesta" />
                <span>Memuat statistik 7 hari...</span>
              </div>
            ) : topArticles7Days.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 font-mono text-xs">
                Belum ada riwayat kunjungan dalam 7 hari terakhir.
              </div>
            ) : (
              <div className="space-y-3.5">
                {topArticles7Days.map((item, idx) => {
                  const widthPct = Math.round((item.count / maxArticleViews) * 100);
                  return (
                    <div key={item.key || idx} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-zinc-500 text-[11px] flex-shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-zinc-200 font-medium truncate" title={item.title}>
                            {item.title}
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-none flex-shrink-0 hidden sm:inline-block">
                            {item.category}
                          </span>
                        </div>
                        <span className="font-mono text-semesta font-bold text-xs flex-shrink-0">
                          {item.count} view{item.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-none overflow-hidden">
                        <div
                          className="h-full bg-semesta transition-all duration-500"
                          style={{ width: `${Math.max(widthPct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel Kanan: Platform Asal Pengunjung (7 Hari Terakhir) */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Platform Asal Pengunjung (7 Hari Terakhir)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {platforms7Days.length} platform
              </span>
            </div>

            {loadingViews ? (
              <div className="py-8 text-center text-zinc-500 font-mono text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Memuat data platform...</span>
              </div>
            ) : platforms7Days.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 font-mono text-xs">
                Belum ada data sumber lalu lintas tercatat.
              </div>
            ) : (
              <div className="space-y-3">
                {platforms7Days.map((item, idx) => {
                  const widthPct = Math.round((item.count / maxPlatformViews) * 100);
                  return (
                    <div key={item.name || idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-200">{item.name}</span>
                        <span className="text-zinc-400">
                          <strong className="text-white font-bold">{item.count}</strong> ({item.pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-none overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-500"
                          style={{ width: `${Math.max(widthPct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rasio Perangkat: Mobile vs Desktop */}
          <div className="border-t border-zinc-800 pt-3 mt-4 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="text-zinc-500">Rasio Perangkat:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5" title="Kunjungan dari perangkat Mobile">
                <Smartphone className="w-3.5 h-3.5 text-semesta" />
                <span>Mobile: <strong className="text-zinc-200">{mobileViewsCount}</strong> ({mobilePct}%)</span>
              </div>
              <div className="flex items-center gap-1.5" title="Kunjungan dari perangkat Desktop">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>Desktop: <strong className="text-zinc-200">{desktopViewsCount}</strong> ({desktopPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Sort Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-none">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, kategori, atau slug..."
            className="bg-transparent text-zinc-100 text-xs sm:text-sm font-mono w-full outline-none placeholder:text-zinc-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-mono text-zinc-400 hover:text-white"
            >
              Reset
            </button>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-none p-1 gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSortBy('latest')}
            className={`px-3 py-1.5 text-xs font-mono rounded-none transition-colors flex items-center gap-1.5 ${
              sortBy === 'latest'
                ? 'bg-semesta text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Terbaru</span>
          </button>
          <button
            type="button"
            onClick={() => setSortBy('views')}
            className={`px-3 py-1.5 text-xs font-mono rounded-none transition-colors flex items-center gap-1.5 ${
              sortBy === 'views'
                ? 'bg-semesta text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Views Terbanyak</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-400 font-mono text-xs rounded-none flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-semesta animate-spin" />
          <span>Mengambil data artikel dari Firestore...</span>
        </div>
      ) : error ? (
        <div className="border border-red-500/50 bg-red-950/20 p-6 text-center text-red-400 font-mono text-sm rounded-none">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="mb-4">{error}</p>
          <button
            type="button"
            onClick={handleReload}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold font-mono rounded-none inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Muat Ulang
          </button>
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="border border-zinc-800 bg-zinc-900 p-12 text-center rounded-none">
          <p className="text-zinc-400 font-mono text-sm mb-4">
            {searchQuery
              ? 'Tidak ada artikel yang cocok dengan pencarian Anda.'
              : 'Belum ada artikel di database. Mulai dengan membuat artikel pertama!'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('admin-blog-create')}
            className="bg-semesta hover:bg-semesta/90 text-white px-4 py-2 text-xs font-bold font-mono rounded-none inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Artikel
          </button>
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-900 overflow-x-auto rounded-none">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 font-mono text-zinc-400 text-xs">
                <th className="p-4 font-semibold">Artikel</th>
                <th className="p-4 font-semibold hidden md:table-cell">Kategori</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Unggulan</th>
                <th className="p-4 font-semibold text-center">Views</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {displayedPosts.map((post) => {
                const isItemLoading = actionLoadingId === post.id;
                return (
                  <tr
                    key={post.id}
                    className="hover:bg-zinc-800/40 transition-colors group text-zinc-200"
                  >
                    {/* Judul & Info */}
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        {post.coverImage?.url ? (
                          <img
                            src={post.coverImage.url}
                            alt=""
                            className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded-none border border-zinc-700 flex-shrink-0 bg-zinc-800"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/placeholder-blog.svg';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-8 sm:w-16 sm:h-10 bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center text-zinc-500 font-mono text-[10px]">
                            No img
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white group-hover:text-semesta transition-colors line-clamp-1">
                            {post.title}
                          </p>
                          <p className="font-mono text-[11px] text-zinc-500 truncate max-w-xs sm:max-w-md">
                            /{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="p-4 hidden md:table-cell">
                      <span className="font-mono text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-none">
                        {post.category || 'Umum'}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-4">
                      <button
                        type="button"
                        disabled={isItemLoading}
                        onClick={() => handleToggleStatus(post)}
                        className={`font-mono text-xs px-2.5 py-1 rounded-none border transition-colors inline-flex items-center gap-1.5 ${
                          post.status === 'published'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                        }`}
                        title="Klik untuk ubah status"
                      >
                        {post.status === 'published' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        disabled={isItemLoading}
                        onClick={() => handleToggleFeatured(post)}
                        className={`p-1.5 rounded-none border transition-colors ${
                          post.isFeatured
                            ? 'bg-semesta text-white border-semesta'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                        }`}
                        title={post.isFeatured ? 'Artikel Unggulan (Aktif)' : 'Bukan Unggulan'}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>

                    {/* Views Count */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-300 bg-zinc-800/60 border border-zinc-700/60 px-2 py-0.5 rounded-none">
                        <Eye className="w-3.5 h-3.5 text-semesta" />
                        <span className="font-bold text-white">{post.views || 0}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View live */}
                        <button
                          type="button"
                          onClick={() => onNavigate('blog-detail', post.slug)}
                          className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-none transition-colors"
                          title="Lihat Halaman Publik"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => onNavigate('admin-blog-edit', post.slug)}
                          className="p-1.5 text-semesta hover:text-white bg-zinc-800 hover:bg-semesta border border-zinc-700 rounded-none transition-colors"
                          title="Edit Artikel"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={isItemLoading}
                          onClick={() => handleDelete(post)}
                          className="p-1.5 text-red-400 hover:text-white bg-zinc-800 hover:bg-red-600 border border-zinc-700 rounded-none transition-colors disabled:opacity-50"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
