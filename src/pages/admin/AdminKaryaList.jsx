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
  ExternalLink,
  Star,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Loader2,
  FolderGit2,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function AdminKaryaList({ onNavigate = () => {} }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    if (!isFirebaseConfigured || !db) {
      setError('Firebase Firestore belum terhubung.');
      setLoading(false);
      return;
    }

    try {
      const snap = await getDocs(collection(db, 'projects'));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Urutkan berdasarkan field order (angka kecil di atas), fallback ke createdAt
      list.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
      setProjects(list);
    } catch (err) {
      console.error('Gagal mengambil daftar karya admin:', err);
      setError('Gagal memuat karya dari database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Quick Toggle Bintang (isFeatured true <-> false) secara real-time
  const handleToggleFeatured = async (project) => {
    const currentStatus = Boolean(project.isFeatured);
    const newFeatured = !currentStatus;
    const docId = project.slug || project.id;

    setActionLoadingId(docId);
    try {
      const docRef = doc(db, 'projects', docId);
      await updateDoc(docRef, {
        isFeatured: newFeatured,
        updatedAt: new Date().toISOString(),
      });

      setProjects((prev) =>
        prev.map((item) =>
          (item.slug === docId || item.id === docId)
            ? { ...item, isFeatured: newFeatured }
            : item
        )
      );

      toast.success(
        newFeatured
          ? `⭐ "${project.title}" dijadikan Karya Terpilih di Beranda!`
          : `Karya "${project.title}" dihapus dari sorotan Beranda.`
      );
    } catch (err) {
      console.error('Gagal mengubah status bintang:', err);
      toast.error('Gagal memperbarui status bintang: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Hapus karya dengan konfirmasi aman
  const handleDelete = async (project) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus karya "${project.title}"?\nTindakan ini akan menghapus data dari koleksi Firestore secara permanen.`
    );
    if (!confirmDelete) return;

    const docId = project.slug || project.id;
    setActionLoadingId(docId);

    try {
      const docRef = doc(db, 'projects', docId);
      await deleteDoc(docRef);
      setProjects((prev) => prev.filter((item) => item.id !== docId && item.slug !== docId));
      toast.success(`Karya "${project.title}" berhasil dihapus.`);
    } catch (err) {
      console.error('Gagal menghapus karya:', err);
      toast.error('Gagal menghapus karya: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (p.title || '').toLowerCase().includes(q);
    const categoryMatch = (p.category || '').toLowerCase().includes(q);
    const badgeMatch = (p.badge || '').toLowerCase().includes(q);
    const slugMatch = (p.slug || '').toLowerCase().includes(q);
    const tagsMatch = Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q));
    return titleMatch || categoryMatch || badgeMatch || slugMatch || tagsMatch;
  });

  const totalFeatured = projects.filter((p) => p.isFeatured).length;
  const totalWeb = projects.filter((p) => p.category === 'Web Development').length;
  const totalDesign = projects.filter((p) => p.category === 'Desain Grafis').length;
  const totalMultimedia = projects.filter((p) => p.category === 'Multimedia').length;
  const totalUIUX = projects.filter((p) => p.category === 'UI/UX Design').length;

  return (
    <AdminLayout currentAdminView="karya-list" onNavigate={onNavigate}>
      <Toaster position="top-right" richColors />

      {/* Top Bar / Stats */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Manajemen Katalog Karya
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 font-mono">
            Kelola data portofolio, atur urutan tampilan, dan toggle bintang (featured) untuk beranda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('admin-karya-create')}
          className="bg-semesta hover:bg-semesta/90 text-white font-semibold py-2.5 px-4 rounded-none text-xs sm:text-sm font-mono flex items-center justify-center gap-2 transition-colors self-start md:self-auto shadow-none"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Karya Baru</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-none shadow-none">
          <span className="text-zinc-400 text-[11px] font-mono block">Total Karya</span>
          <span className="text-xl font-bold text-white font-mono">{projects.length}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-none shadow-none">
          <span className="text-zinc-400 text-[11px] font-mono block">Featured (⭐)</span>
          <span className="text-xl font-bold text-amber-400 font-mono">{totalFeatured}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-none shadow-none">
          <span className="text-zinc-400 text-[11px] font-mono block">Web Dev</span>
          <span className="text-xl font-bold text-sky-400 font-mono">{totalWeb}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-none shadow-none">
          <span className="text-zinc-400 text-[11px] font-mono block">Desain Grafis</span>
          <span className="text-xl font-bold text-purple-400 font-mono">{totalDesign}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-none shadow-none">
          <span className="text-zinc-400 text-[11px] font-mono block">Multimedia</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{totalMultimedia}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-none shadow-none">
          <span className="text-zinc-400 text-[11px] font-mono block">UI/UX Design</span>
          <span className="text-xl font-bold text-pink-400 font-mono">{totalUIUX}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-none shadow-none">
        <Search className="w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan judul, kategori, badge, atau teknologi..."
          className="bg-transparent text-zinc-100 text-xs sm:text-sm font-mono w-full outline-none placeholder:text-zinc-600 rounded-none shadow-none"
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
        <div className="border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-400 font-mono text-xs rounded-none flex items-center justify-center gap-3 shadow-none">
          <Loader2 className="w-5 h-5 text-semesta animate-spin" />
          <span>Mengambil katalog karya dari Cloud Firestore...</span>
        </div>
      ) : error ? (
        <div className="border border-red-500/50 bg-red-950/20 p-6 text-center text-red-400 font-mono text-sm rounded-none shadow-none">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchProjects}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold font-mono rounded-none inline-flex items-center gap-1.5 shadow-none"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Muat Ulang
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="border border-zinc-800 bg-zinc-900 p-12 text-center rounded-none shadow-none">
          <FolderGit2 className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 font-mono text-sm mb-4">
            {searchQuery
              ? 'Tidak ada karya yang cocok dengan kata kunci pencarian Anda.'
              : 'Belum ada karya di database Firestore. Mulai tambahkan karya portofolio Anda!'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('admin-karya-create')}
            className="bg-semesta hover:bg-semesta/90 text-white px-4 py-2 text-xs font-bold font-mono rounded-none inline-flex items-center gap-1.5 shadow-none"
          >
            <Plus className="w-4 h-4" /> Tambah Karya Baru
          </button>
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-900 overflow-x-auto rounded-none shadow-none">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 font-mono text-zinc-400 text-xs">
                <th className="p-4 font-semibold">Karya</th>
                <th className="p-4 font-semibold hidden md:table-cell">Kategori</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Badge</th>
                <th className="p-4 font-semibold text-center">Urutan</th>
                <th className="p-4 font-semibold text-center">Bintang (Beranda)</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredProjects.map((project) => {
                const docId = project.slug || project.id;
                const isItemLoading = actionLoadingId === docId;
                const cover = project.coverImage || project.thumbnail;
                const link = project.demoUrl || project.projectUrl || project.link;

                return (
                  <tr
                    key={docId}
                    className="hover:bg-zinc-800/40 transition-colors group text-zinc-200"
                  >
                    {/* Cover & Info */}
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        {cover ? (
                          <img
                            src={cover}
                            alt=""
                            className="w-14 h-9 sm:w-16 sm:h-10 object-cover rounded-none border border-zinc-700 flex-shrink-0 bg-zinc-800 shadow-none"
                          />
                        ) : (
                          <div className="w-14 h-9 sm:w-16 sm:h-10 bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center text-zinc-500 font-mono text-[10px] rounded-none shadow-none">
                            No img
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white group-hover:text-semesta transition-colors line-clamp-1">
                            {project.title}
                          </p>
                          <p className="font-mono text-[11px] text-zinc-500 truncate max-w-xs sm:max-w-md">
                            /{project.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="p-4 hidden md:table-cell">
                      <span className="font-mono text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-none shadow-none">
                        {project.category || 'Lainnya'}
                      </span>
                    </td>

                    {/* Badge */}
                    <td className="p-4 hidden lg:table-cell">
                      {project.badge ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 bg-semesta/10 text-semesta border border-semesta/30 rounded-none shadow-none">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{project.badge}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600 font-mono text-xs">-</span>
                      )}
                    </td>

                    {/* Urutan (Order) */}
                    <td className="p-4 text-center font-mono text-xs text-zinc-400">
                      #{project.order || 99}
                    </td>

                    {/* Quick Toggle Bintang (Featured) */}
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        disabled={isItemLoading}
                        onClick={() => handleToggleFeatured(project)}
                        className={`p-1.5 rounded-none border transition-colors inline-flex items-center justify-center shadow-none cursor-pointer ${
                          project.isFeatured
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
                            : 'bg-zinc-800 text-zinc-600 border-zinc-700 hover:text-zinc-400 hover:bg-zinc-700'
                        }`}
                        title={
                          project.isFeatured
                            ? `⭐ Karya Terpilih: "${project.featuredLabel || 'Terpilih'}" (Klik untuk nonaktifkan)`
                            : 'Bukan Terpilih (Klik untuk jadikan Karya Terpilih di Beranda)'
                        }
                      >
                        {isItemLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        ) : (
                          <Star
                            className={`w-4 h-4 ${
                              project.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'
                            }`}
                          />
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Live Demo Link */}
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-none transition-colors shadow-none"
                            title="Buka Live URL / Demo"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => onNavigate('admin-karya-edit', project.slug)}
                          className="p-1.5 text-semesta hover:text-white bg-zinc-800 hover:bg-semesta border border-zinc-700 rounded-none transition-colors shadow-none"
                          title="Edit Karya"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={isItemLoading}
                          onClick={() => handleDelete(project)}
                          className="p-1.5 text-red-400 hover:text-white bg-zinc-800 hover:bg-red-600 border border-zinc-700 rounded-none transition-colors disabled:opacity-50 shadow-none"
                          title="Hapus Karya"
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
