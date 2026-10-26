import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { uploadBlogImage } from '../../lib/uploader';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  X,
  FileJson,
  FolderGit2,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { slugify } from '../../utils/slugify';

const CATEGORIES = [
  'Web Development',
  'Desain Grafis',
  'Multimedia',
  'UI/UX Design',
];

export default function AdminKaryaEditor({ slug: initialSlug, onNavigate = () => {} }) {
  const isEditMode = Boolean(initialSlug);

  const [loadingProject, setLoadingProject] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [autoSlug, setAutoSlug] = useState(!isEditMode);

  // Modal Impor JSON Cepat
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Web Development',
    badge: '',
    excerpt: '',
    coverImage: '',
    tags: '',
    demoUrl: '',
    projectUrl: '',
    repoUrl: '',
    isFeatured: false,
    order: 1,
  });

  // Jika Edit Mode, muat data dari Firestore
  useEffect(() => {
    if (!isEditMode) return;

    async function loadProject() {
      setLoadingProject(true);
      setErrorMessage(null);

      if (!isFirebaseConfigured || !db) {
        setErrorMessage('Firebase belum terhubung.');
        setLoadingProject(false);
        return;
      }

      try {
        const docRef = doc(db, 'projects', initialSlug);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          setErrorMessage(`Karya dengan slug "${initialSlug}" tidak ditemukan di Firestore.`);
          toast.error('Karya tidak ditemukan.');
          return;
        }

        const data = snap.data();
        setFormData({
          title: data.title || '',
          slug: data.slug || initialSlug,
          category: data.category || 'Web Development',
          badge: data.badge || '',
          excerpt: data.excerpt || data.description || '',
          coverImage: data.coverImage || data.thumbnail || '',
          tags: Array.isArray(data.tags)
            ? data.tags.join(', ')
            : Array.isArray(data.tools)
            ? data.tools.join(', ')
            : data.tags || '',
          demoUrl: data.demoUrl || data.link || '',
          projectUrl: data.projectUrl || data.demoUrl || data.link || '',
          repoUrl: data.repoUrl || '',
          isFeatured: Boolean(data.isFeatured),
          order: Number(data.order) || 1,
        });
        setAutoSlug(false);
      } catch (err) {
        console.error('Gagal memuat karya:', err);
        setErrorMessage('Gagal memuat data karya: ' + err.message);
        toast.error('Gagal memuat data karya.');
      } finally {
        setLoadingProject(false);
      }
    }

    loadProject();
  }, [initialSlug, isEditMode]);

  // Handler auto-generate slug saat mengetik judul
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: autoSlug ? slugify(val) : prev.slug,
    }));
  };

  // Upload Cover Image via 2-stage uploader (Cloudinary -> Rumahweb CDN)
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setErrorMessage(null);
    try {
      const finalUrl = await uploadBlogImage(file);
      setFormData((prev) => ({
        ...prev,
        coverImage: finalUrl,
      }));
      toast.success('Gambar cover berhasil diunggah ke Rumahweb CDN!');
    } catch (err) {
      console.error('Gagal upload cover karya:', err);
      setErrorMessage(`Gagal mengunggah cover image: ${err.message}`);
      toast.error('Gagal upload cover: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Handler Impor Cepat dari JSON
  const handleApplyJsonImport = () => {
    setJsonError(null);
    const trimmed = jsonInput.trim();
    if (!trimmed) {
      setJsonError('Silakan tempelkan teks JSON karya terlebih dahulu.');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch (err) {
      setJsonError(`Format JSON tidak valid: ${err.message}`);
      return;
    }

    const item = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!item || typeof item !== 'object') {
      setJsonError('Data JSON harus berupa objek karya.');
      return;
    }

    const title = item.title || item.rawTitle || '';
    const targetSlug = item.slug || item.id || slugify(title);
    const category = item.category || 'Web Development';
    const badge = item.badge || '';
    const excerpt = item.excerpt || item.description || item.desc || item.rawSummary || '';
    const incomingCover = item.coverImage || item.thumbnail || item.image || '';

    let tags = '';
    if (Array.isArray(item.tags)) {
      tags = item.tags.join(', ');
    } else if (Array.isArray(item.tools)) {
      tags = item.tools.join(', ');
    } else if (typeof item.tags === 'string') {
      tags = item.tags;
    }

    const demoUrl = item.demoUrl || item.link || item.url || '';
    const projectUrl = item.projectUrl || item.link || item.url || '';
    const repoUrl = item.repoUrl || '';
    const isFeatured = Boolean(item.isFeatured);
    const order = Number(item.order) || 1;

    setFormData((prev) => ({
      ...prev,
      title: title || prev.title,
      slug: targetSlug || prev.slug,
      category,
      badge: badge || prev.badge,
      excerpt: excerpt || prev.excerpt,
      tags: tags || prev.tags,
      demoUrl: demoUrl || prev.demoUrl,
      projectUrl: projectUrl || prev.projectUrl,
      repoUrl: repoUrl || prev.repoUrl,
      isFeatured: isFeatured !== undefined ? isFeatured : prev.isFeatured,
      order: order || prev.order,
      coverImage: incomingCover || prev.coverImage,
    }));

    setAutoSlug(false);
    setImportModalOpen(false);
    setJsonInput('');
    setJsonError(null);
    toast.success('Data karya berhasil dimuat ke formulir!');
  };

  // Simpan data karya ke Firestore
  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi form
    if (!formData.title.trim()) {
      toast.error('Judul karya wajib diisi.');
      return;
    }

    const finalSlug = (formData.slug || slugify(formData.title)).trim();
    if (!finalSlug) {
      toast.error('Slug URL wajib diisi.');
      return;
    }

    if (!formData.coverImage.trim()) {
      toast.error('URL gambar cover wajib diisi atau diunggah.');
      return;
    }

    // Parsing tags
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);

    try {
      const payload = {
        id: finalSlug,
        slug: finalSlug,
        title: formData.title.trim(),
        category: formData.category,
        badge: formData.badge.trim(),
        excerpt: formData.excerpt.trim(),
        description: formData.excerpt.trim(),
        coverImage: formData.coverImage.trim(),
        tags: tagsArray,
        demoUrl: formData.demoUrl.trim(),
        projectUrl: formData.projectUrl.trim() || formData.demoUrl.trim(),
        repoUrl: formData.repoUrl.trim(),
        isFeatured: Boolean(formData.isFeatured),
        order: Number(formData.order) || 99,
        updatedAt: new Date().toISOString(),
      };

      if (!isEditMode) {
        payload.createdAt = new Date().toISOString();
      }

      const docRef = doc(db, 'projects', finalSlug);
      await setDoc(docRef, payload, { merge: true });

      toast.success(
        isEditMode
          ? `Karya "${payload.title}" berhasil diperbarui!`
          : `Karya "${payload.title}" berhasil ditambahkan ke portofolio!`
      );

      // Beri jeda sejenak lalu arahkan kembali ke daftar karya admin
      setTimeout(() => {
        onNavigate('admin-karya');
      }, 700);
    } catch (err) {
      console.error('Gagal menyimpan karya:', err);
      setErrorMessage(`Gagal menyimpan karya ke database: ${err.message}`);
      toast.error('Gagal menyimpan karya: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout currentAdminView="karya-editor" onNavigate={onNavigate}>
      <Toaster position="top-right" richColors />

      {/* Top Header & Navigation */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('admin-karya')}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-none transition-colors shadow-none"
            title="Kembali ke Daftar Karya"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-semesta" />
              <span>{isEditMode ? 'Edit Karya Portofolio' : 'Tambah Karya Baru'}</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs">
              {isEditMode ? `ID Dokumen: ${initialSlug}` : 'Buat dan rilis karya baru ke katalog publik'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Impor JSON Cepat */}
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-mono font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-semesta rounded-none transition-colors flex items-center gap-1.5 shadow-none"
          >
            <FileJson className="w-3.5 h-3.5 text-semesta" />
            <span>⚡ Impor dari JSON</span>
          </button>

          {/* Tombol Simpan */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loadingProject}
            className="bg-semesta hover:bg-semesta/90 text-white font-mono font-semibold px-5 py-2 text-xs sm:text-sm rounded-none flex items-center gap-2 transition-colors disabled:opacity-50 shadow-none cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Karya</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-950/30 border border-red-500/50 text-red-400 text-xs font-mono rounded-none flex items-center gap-2.5 shadow-none">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loadingProject ? (
        <div className="border border-zinc-800 bg-zinc-900/50 p-16 text-center text-zinc-400 font-mono text-xs rounded-none flex items-center justify-center gap-3 shadow-none">
          <Loader2 className="w-5 h-5 text-semesta animate-spin" />
          <span>Memuat data karya dari database Firestore...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Data Utama */}
          <div className="lg:col-span-2 space-y-6">
            {/* Judul Karya */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-none shadow-none space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Judul Karya *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Contoh: Website E-Commerce TokoSaya"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-semesta text-white px-3.5 py-2.5 text-sm rounded-none outline-none transition-colors shadow-none placeholder:text-zinc-600"
                />
              </div>

              {/* Slug URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-semibold text-zinc-300">
                    Slug URL (Document ID) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[11px] font-mono text-semesta hover:underline"
                  >
                    {autoSlug ? '🔒 Kunci Slug' : '⚡ Otomatis dari Judul'}
                  </button>
                </div>
                <div className="flex items-center bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs font-mono text-zinc-400 rounded-none shadow-none">
                  <span className="text-zinc-600 mr-1">projects/</span>
                  <input
                    type="text"
                    required
                    disabled={autoSlug}
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))
                    }
                    placeholder="website-e-commerce-tokosaya"
                    className="bg-transparent text-white w-full outline-none disabled:opacity-75"
                  />
                </div>
              </div>

              {/* Deskripsi Singkat */}
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Deskripsi / Excerpt Ringkas *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Deskripsikan fitur utama, tantangan, atau pencapaian dari proyek ini..."
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-semesta text-white p-3 text-xs sm:text-sm rounded-none outline-none transition-colors shadow-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Link & Teknologi */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-none shadow-none space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
                Tautan & Teknologi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* URL Live Demo */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                    URL Live Demo (Opsional)
                  </label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, demoUrl: e.target.value }))}
                    placeholder="https://toko-saya.pages.dev"
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none transition-colors shadow-none placeholder:text-zinc-600"
                  />
                </div>

                {/* URL Repository / Source Code */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                    URL Proyek / Repository (Opsional)
                  </label>
                  <input
                    type="url"
                    value={formData.projectUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, projectUrl: e.target.value }))
                    }
                    placeholder="https://github.com/..."
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none transition-colors shadow-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Tags / Tools */}
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Tech-Stack / Tools (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="React, Tailwind CSS, Vite, Cloudflare Pages"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-semesta text-white px-3.5 py-2 text-xs font-mono rounded-none outline-none transition-colors shadow-none placeholder:text-zinc-600"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, i) => (
                      <span
                        key={i}
                        className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono px-2 py-0.5 rounded-none shadow-none"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Pengaturan & Media */}
          <div className="space-y-6">
            {/* Pengaturan Kategori & Tampilan */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-none shadow-none space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
                Kategori & Sorotan
              </h3>

              {/* Dropdown Kategori */}
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Kategori *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-semesta text-white px-3 py-2.5 text-xs font-mono rounded-none outline-none transition-colors shadow-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Badge Label Singkat */}
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Badge Label Singkat (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="Contoh: React + Cloudflare, Lomba Animasi"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none transition-colors shadow-none placeholder:text-zinc-600"
                />
              </div>

              {/* Urutan Tampilan (Order) */}
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Urutan Tampilan (Order)
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, order: Number(e.target.value) || 1 }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none transition-colors shadow-none"
                />
                <span className="text-[11px] text-zinc-500 font-mono block mt-1">
                  Angka lebih kecil akan tampil lebih awal di galeri.
                </span>
              </div>

              {/* Switch Featured (Karya Terpilih di Beranda) */}
              <div className="pt-2 border-t border-zinc-800">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                    }
                    className="mt-0.5 w-4 h-4 rounded-none accent-[#5b21b6] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-mono font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Jadikan Karya Terpilih (Featured ⭐)</span>
                    </span>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5 leading-relaxed">
                      Karya ini akan langsung ditampilkan di bagian "Portfolio Showcase" pada halaman Beranda utama.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Cover Image Upload (Rumahweb CDN) */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-none shadow-none space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
                Cover Image Proyek
              </h3>

              {/* Preview Cover */}
              <div className="aspect-video w-full bg-zinc-950 border border-zinc-800 rounded-none overflow-hidden relative flex items-center justify-center shadow-none">
                {formData.coverImage ? (
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover rounded-none"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <span className="text-[11px] font-mono text-zinc-500 block">
                      Belum ada gambar cover
                    </span>
                  </div>
                )}
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-xs font-mono gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-semesta" />
                    <span>Mengunggah ke Rumahweb CDN...</span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div>
                <label className="block w-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingCover}
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <div className="w-full py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-semibold rounded-none border border-zinc-700 hover:border-semesta transition-colors flex items-center justify-center gap-2 shadow-none cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-semesta" />
                    <span>Unggah Gambar via CDN</span>
                  </div>
                </label>
              </div>

              {/* Manual URL Input */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Atau masukkan URL gambar langsung:
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                  }
                  placeholder="https://res.cloudinary.com/... atau https://cdn.sumestawsome.xyz/..."
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-semesta text-white px-2.5 py-1.5 text-xs font-mono rounded-none outline-none transition-colors shadow-none placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Modal Impor JSON Cepat */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl p-6 rounded-none shadow-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                <FileJson className="w-4 h-4 text-semesta" />
                <span>Impor Cepat Data Karya dari JSON</span>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Tempelkan cuplikan raw JSON objek karya (misalnya dari <code className="text-zinc-200">karya.json</code> atau dokumen Firestore). Field seperti judul, slug, kategori, badge, deskripsi, dan tags akan otomatis terpetakan ke formulir.
            </p>

            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{\n  "title": "Website Baru",\n  "category": "Web Development",\n  "badge": "React + Vite",\n  "desc": "Ringkasan proyek...",\n  "tools": ["React", "Tailwind"]\n}'
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-zinc-200 p-3 font-mono text-xs rounded-none outline-none shadow-none"
            />

            {jsonError && (
              <div className="text-red-400 text-xs font-mono bg-red-950/40 p-2.5 border border-red-500/30 rounded-none">
                {jsonError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white bg-zinc-800 rounded-none shadow-none"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyJsonImport}
                className="px-4 py-2 text-xs font-mono font-bold text-white bg-semesta hover:bg-semesta/90 rounded-none shadow-none flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Terapkan ke Form</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
