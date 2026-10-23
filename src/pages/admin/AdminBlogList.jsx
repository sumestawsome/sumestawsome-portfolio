import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
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
} from 'lucide-react';

export default function AdminBlogList({ onNavigate = () => {} }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

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

      // Urutkan artikel terbaru di atas
      list.sort((a, b) => new Date(b.publishedAt || b.updatedAt || 0) - new Date(a.publishedAt || a.updatedAt || 0));
      setPosts(list);
    } catch (err) {
      console.error('Gagal mengambil daftar artikel admin:', err);
      setError('Gagal memuat artikel dari database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

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

  const totalPublished = posts.filter((p) => p.status === 'published').length;
  const totalDraft = posts.filter((p) => p.status === 'draft').length;
  const totalFeatured = posts.filter((p) => p.isFeatured).length;

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-none">
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
            onClick={fetchArticles}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold font-mono rounded-none inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Muat Ulang
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
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
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredPosts.map((post) => {
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
