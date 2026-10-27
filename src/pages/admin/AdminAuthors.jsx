import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { uploadBlogImage } from '../../lib/uploader';
import { slugify } from '../../utils/slugify';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Upload,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  X,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function AdminAuthors({ onNavigate = () => {} }) {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: '',
    avatar: '',
    url: 'https://sumestawsome.xyz',
  });

  const fetchAuthors = async () => {
    setLoading(true);
    setErrorMessage(null);

    if (!isFirebaseConfigured || !db) {
      setErrorMessage('Firebase Firestore belum terhubung.');
      setLoading(false);
      return;
    }

    try {
      const snap = await getDocs(collection(db, 'authors'));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setAuthors(list);
    } catch (err) {
      console.error('Gagal mengambil daftar penulis:', err);
      setErrorMessage('Gagal memuat data penulis: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // Handle upload avatar via uploader.js dengan penamaan ramah SEO
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setErrorMessage(null);
    try {
      const authorPrefix = formData.name ? `avatar-${formData.name}` : 'avatar-author';
      const uploadedUrl = await uploadBlogImage(file, authorPrefix);
      setFormData((prev) => ({
        ...prev,
        avatar: uploadedUrl,
      }));
      toast.success('Foto profil berhasil diunggah!');
    } catch (err) {
      console.error('Gagal upload avatar:', err);
      toast.error(`Gagal upload avatar: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditClick = (author) => {
    setEditingId(author.id);
    setFormData({
      id: author.id,
      name: author.name || '',
      role: author.role || '',
      avatar: author.avatar || '',
      url: author.url || 'https://sumestawsome.xyz',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      id: '',
      name: '',
      role: '',
      avatar: '',
      url: 'https://sumestawsome.xyz',
    });
  };

  const handleDeleteAuthor = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus profil penulis "${name || id}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'authors', id));
      setAuthors((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
      toast.success(`Profil "${name}" berhasil dihapus.`);
    } catch (err) {
      console.error('Gagal menghapus penulis:', err);
      toast.error(`Gagal menghapus penulis: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama penulis wajib diisi.');
      return;
    }

    const docId = editingId || slugify(formData.id || formData.name);
    if (!docId) {
      toast.error('ID atau Slug profil tidak valid.');
      return;
    }

    setSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const payload = {
        id: docId,
        name: formData.name.trim(),
        role: formData.role.trim(),
        avatar:
          formData.avatar.trim() ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            formData.name.trim()
          )}&background=2563eb&color=fff&bold=true`,
        url: formData.url.trim() || 'https://sumestawsome.xyz',
        updatedAt: nowIso,
      };

      await setDoc(doc(db, 'authors', docId), payload, { merge: true });

      toast.success(
        editingId
          ? 'Profil penulis berhasil diperbarui!'
          : 'Profil penulis baru berhasil ditambahkan!'
      );

      handleCancelEdit();
      await fetchAuthors();
    } catch (err) {
      console.error('Gagal menyimpan profil penulis:', err);
      toast.error(`Gagal menyimpan: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout currentAdminView="authors" onNavigate={onNavigate}>
      <Toaster position="top-right" richColors />

      {/* Top Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-semesta" />
            <h1 className="text-xl font-bold font-mono text-white tracking-tight">
              Kelola Profil Penulis
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Daftar profil resmi untuk atribut artikel blog yang tersimpan di Firestore.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAuthors}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-2 text-xs font-mono border border-zinc-800 transition-colors rounded-none self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-800 text-red-200 text-xs font-mono rounded-none flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Tambah / Edit Penulis (5 Kolom) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 rounded-none space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-semesta" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-semesta">
                {editingId ? 'Edit Profil Penulis' : 'Tambah Profil Penulis'}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Batal
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input ID Dokumen */}
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                ID Dokumen (Slug)
              </label>
              <input
                type="text"
                disabled={Boolean(editingId)}
                value={formData.id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    id: slugify(e.target.value),
                  }))
                }
                placeholder={slugify(formData.name) || 'contoh: agus'}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none font-mono disabled:opacity-50"
              />
              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                {editingId
                  ? 'ID dokumen tidak dapat diubah saat mode edit.'
                  : 'Jika dikosongkan, ID dibuat otomatis dari nama penulis.'}
              </span>
            </div>

            {/* Input Nama Penulis */}
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name: val,
                    id: editingId ? prev.id : prev.id || slugify(val),
                  }));
                }}
                placeholder="Putu Agus Sumerta Yasa"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none font-mono"
              />
            </div>

            {/* Input Peran / Bio */}
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                Peran / Bio Ringkas
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.value,
                  }))
                }
                placeholder="Frontend Developer & Graphic Designer"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none font-mono"
              />
            </div>

            {/* Input URL Profil */}
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                URL Portofolio / Profil
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    url: e.target.value,
                  }))
                }
                placeholder="https://sumestawsome.xyz"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none font-mono"
              />
            </div>

            {/* Upload & Input URL Avatar */}
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                Foto Profil (Avatar)
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs py-2 px-3 rounded-none cursor-pointer border border-zinc-700 transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-semesta" />
                    <span>Unggah Foto Avatar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                  {uploadingAvatar && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-semesta">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah...</span>
                    </div>
                  )}
                </div>

                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      avatar: e.target.value,
                    }))
                  }
                  placeholder="https://ui-avatars.com/... atau URL CDN"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none"
                />

                {/* Pratinjau Avatar Langsung */}
                <div className="flex items-center gap-3 p-2.5 bg-zinc-950 border border-zinc-800 rounded-none">
                  <img
                    src={
                      formData.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        formData.name || 'User'
                      )}&background=2563eb&color=fff&bold=true`
                    }
                    alt={formData.name || 'Pratinjau'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        formData.name || 'Admin'
                      )}&background=2563eb&color=fff&bold=true`;
                    }}
                    className="w-10 h-10 object-cover border border-zinc-700 rounded-none bg-zinc-800 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 font-mono">
                    <div className="text-xs text-zinc-300 font-semibold truncate">
                      {formData.name || 'Nama Penulis'}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {formData.role || 'Bio/Peran'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-semesta hover:bg-semesta/90 text-white font-mono font-bold text-xs py-2.5 px-4 rounded-none transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan ke Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{editingId ? 'Simpan Perubahan' : 'Tambah Penulis'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Daftar Kartu Penulis (7 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Daftar Penulis Terdaftar ({authors.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-none">
              <Loader2 className="w-6 h-6 animate-spin text-semesta mx-auto mb-2" />
              <p className="text-xs font-mono text-zinc-400">Memuat profil penulis...</p>
            </div>
          ) : authors.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-none">
              <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-mono text-zinc-400">
                Belum ada data penulis di koleksi Firestore authors.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className={`p-4 bg-zinc-900 border transition-colors rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    editingId === author.id
                      ? 'border-semesta bg-semesta/5'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          author.name || 'Admin'
                        )}&background=2563eb&color=fff&bold=true`;
                      }}
                      className="w-12 h-12 object-cover border border-zinc-700 rounded-none bg-zinc-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate font-sans">
                          {author.name}
                        </span>
                        <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded-none border border-zinc-700">
                          {author.id}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5 font-sans">
                        {author.role || 'Tidak ada peran'}
                      </p>
                      {author.url && (
                        <a
                          href={author.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-semesta hover:underline mt-1"
                        >
                          <span>{author.url}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditClick(author)}
                      className="p-2 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-none transition-colors"
                      title="Edit Penulis"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAuthor(author.id, author.name)}
                      className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-950 border border-zinc-800 hover:border-red-900/40 rounded-none transition-colors"
                      title="Hapus Penulis"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
