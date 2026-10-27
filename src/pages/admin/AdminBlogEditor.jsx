import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { uploadBlogImage } from '../../lib/uploader';
import AdminLayout from '../../components/admin/AdminLayout';
import CodeBlock from '../../components/blog/CodeBlock';
import {
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
  FileCode,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  X,
  FileJson,
  User,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { slugify } from '../../utils/slugify';

const DEFAULT_AUTHOR = {
  name: 'Admin Sumesta',
  role: 'Full-stack developer & tech enthusiast.',
  avatar: 'https://ui-avatars.com/api/?name=Admin+Sumesta&background=0f172a&color=fff&bold=true',
  url: 'https://sumestawsome.xyz',
};

export default function AdminBlogEditor({ slug: initialSlug, onNavigate = () => {} }) {
  const isEditMode = Boolean(initialSlug);

  const [loadingPost, setLoadingPost] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal Impor JSON
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState(null);

  // State Profil Penulis Dinamis dari Firestore
  const [authors, setAuthors] = useState([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [selectedAuthorId, setSelectedAuthorId] = useState('admin');
  const [authorSettingsOpen, setAuthorSettingsOpen] = useState(false);

  // Mode editor: 'write' vs 'preview'
  const [editorTab, setEditorTab] = useState('write');
  const [autoSlug, setAutoSlug] = useState(!isEditMode);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: 'Deployment & DevOps',
    tags: 'Vercel, Next.js, GitHub, Web Development',
    readingTime: 5,
    status: 'published',
    isFeatured: false,
    content: '',
    coverImage: {
      url: '',
      alt: '',
      width: 1200,
      height: 630,
    },
    author: {
      name: DEFAULT_AUTHOR.name,
      avatar: DEFAULT_AUTHOR.avatar,
      bio: DEFAULT_AUTHOR.role,
      url: DEFAULT_AUTHOR.url,
    },
    authorRole: DEFAULT_AUTHOR.role,
    authorAvatar: DEFAULT_AUTHOR.avatar,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      canonicalUrl: '',
      ogType: 'article',
      noIndex: false,
    },
  });

  // Load existing post if editing
  useEffect(() => {
    async function loadExistingPost() {
      if (!isEditMode || !initialSlug) return;
      setLoadingPost(true);
      try {
        const docRef = doc(db, 'posts', initialSlug);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            ...data,
            slug: data.slug || initialSlug,
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
            seo: {
              ...data.seo,
              keywords: Array.isArray(data.seo?.keywords)
                ? data.seo.keywords.join(', ')
                : data.seo?.keywords || '',
            },
          });
          const loadedAuthorName =
            data.author?.name || (typeof data.author === 'string' ? data.author : '');
          const matched = authors.find(
            (a) => a.name?.toLowerCase() === loadedAuthorName.toLowerCase()
          );
          if (matched) {
            setSelectedAuthorId(matched.id);
          } else if (loadedAuthorName) {
            setSelectedAuthorId('custom');
          }
          setAutoSlug(false);
        } else {
          setErrorMessage(`Artikel dengan slug "${initialSlug}" tidak ditemukan di database.`);
        }
      } catch (err) {
        console.error('Gagal mengambil data artikel:', err);
        setErrorMessage('Gagal memuat artikel: ' + err.message);
      } finally {
        setLoadingPost(false);
      }
    }

    loadExistingPost();
  }, [isEditMode, initialSlug]);

  // Ambil daftar penulis secara real-time dari Firestore koleksi 'authors'
  useEffect(() => {
    async function fetchAuthors() {
      if (!isFirebaseConfigured || !db) {
        setLoadingAuthors(false);
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
        console.error('Gagal mengambil daftar authors:', err);
      } finally {
        setLoadingAuthors(false);
      }
    }
    fetchAuthors();
  }, []);

  // Sinkronisasi otomatis profil awal saat daftar authors berhasil dimuat
  useEffect(() => {
    if (authors.length === 0) return;
    if (!isEditMode) {
      const defaultMatched = authors.find((a) => a.id === 'admin') || authors[0];
      if (defaultMatched) {
        setSelectedAuthorId(defaultMatched.id);
        setFormData((prev) => ({
          ...prev,
          author: {
            name: defaultMatched.name,
            bio: defaultMatched.role || defaultMatched.bio || '',
            avatar: defaultMatched.avatar || '',
            url: defaultMatched.url || 'https://sumestawsome.xyz',
          },
          authorRole: defaultMatched.role || defaultMatched.bio || '',
          authorAvatar: defaultMatched.avatar || '',
        }));
      }
    } else {
      const currentAuthorName =
        formData.author?.name || (typeof formData.author === 'string' ? formData.author : '');
      const matched = authors.find(
        (a) => a.name?.toLowerCase() === currentAuthorName.toLowerCase()
      );
      if (matched) {
        setSelectedAuthorId(matched.id);
      }
    }
  }, [authors]);

  // Handle Author Selection dari Firestore
  const handleAuthorSelect = (authorId) => {
    setSelectedAuthorId(authorId);
    if (authorId === 'custom') {
      setAuthorSettingsOpen(true);
      return;
    }
    const matched = authors.find((a) => a.id === authorId);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        author: {
          name: matched.name,
          bio: matched.role || matched.bio || '',
          avatar: matched.avatar || '',
          url: matched.url || 'https://sumestawsome.xyz',
        },
        authorRole: matched.role || matched.bio || '',
        authorAvatar: matched.avatar || '',
      }));
    }
  };

  // Handle title change & auto-generate slug
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: autoSlug ? slugify(newTitle) : prev.slug,
      seo: {
        ...prev.seo,
        metaTitle: prev.seo.metaTitle || newTitle,
      },
    }));
  };

  // Auto calculate reading time based on content
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    const words = newContent.trim().split(/\s+/).filter(Boolean).length;
    const computedReadingTime = Math.max(1, Math.ceil(words / 200));

    setFormData((prev) => ({
      ...prev,
      content: newContent,
      readingTime: computedReadingTime,
    }));
  };

  // Handler Impor Cepat dari JSON
  const handleApplyJsonImport = () => {
    setJsonError(null);
    const trimmed = jsonInput.trim();
    if (!trimmed) {
      setJsonError('Silakan tempelkan teks JSON artikel terlebih dahulu.');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch (err) {
      setJsonError(`Format JSON tidak valid: ${err.message}`);
      return;
    }

    // Dukung objek tunggal maupun array artikel
    const article = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!article || typeof article !== 'object') {
      setJsonError('Data JSON harus berupa objek artikel.');
      return;
    }

    const title = article.title?.trim() || '';
    const targetSlug = article.slug?.trim() || slugify(title);
    const category = article.category?.trim() || formData.category || 'Deployment & DevOps';

    let tags = '';
    if (Array.isArray(article.tags)) {
      tags = article.tags.join(', ');
    } else if (typeof article.tags === 'string') {
      tags = article.tags;
    } else {
      tags = formData.tags;
    }

    const excerpt = article.excerpt?.trim() || '';
    const content = article.content || '';

    // Jangan timpa field coverImage jika di JSON hanya berupa URL dummy
    let updatedCoverImage = { ...formData.coverImage };
    const incomingCoverUrl = typeof article.coverImage === 'string'
      ? article.coverImage
      : article.coverImage?.url;

    const isDummyUrl = (url) => {
      if (!url) return true;
      const lower = url.toLowerCase();
      return (
        lower.includes('placehold.co') ||
        lower.includes('placeholder') ||
        lower.includes('dummy') ||
        lower.includes('example.com')
      );
    };

    if (incomingCoverUrl && !isDummyUrl(incomingCoverUrl)) {
      updatedCoverImage = {
        url: incomingCoverUrl,
        alt: article.coverImage?.alt || title,
        width: Number(article.coverImage?.width) || 1200,
        height: Number(article.coverImage?.height) || 630,
      };
    } else if (article.coverImage?.alt) {
      updatedCoverImage.alt = article.coverImage.alt;
    }

    // Hitung reading time
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const computedReadingTime = Number(article.readingTime) || Math.max(1, Math.ceil(words / 200));

    setFormData((prev) => ({
      ...prev,
      title: title || prev.title,
      slug: targetSlug || prev.slug,
      category,
      tags,
      excerpt: excerpt || prev.excerpt,
      content: content || prev.content,
      readingTime: computedReadingTime || prev.readingTime || 5,
      status: article.status === 'draft' ? 'draft' : 'published',
      isFeatured: Boolean(article.isFeatured),
      coverImage: updatedCoverImage,
      author: {
        name:
          article.author?.name ||
          (typeof article.author === 'string' ? article.author : prev.author.name),
        avatar: article.author?.avatar || article.authorAvatar || prev.author.avatar,
        bio: article.author?.bio || article.authorRole || prev.author.bio,
        url: article.author?.url || prev.author.url,
      },
      seo: {
        metaTitle: article.seo?.metaTitle || title || prev.seo.metaTitle,
        metaDescription: article.seo?.metaDescription || excerpt || prev.seo.metaDescription,
        keywords: Array.isArray(article.seo?.keywords)
          ? article.seo.keywords.join(', ')
          : article.seo?.keywords || tags || prev.seo.keywords,
        canonicalUrl:
          article.seo?.canonicalUrl ||
          (targetSlug ? `https://sumestawsome.xyz/blog/${targetSlug}` : prev.seo.canonicalUrl),
        ogType: article.seo?.ogType || 'article',
        noIndex: Boolean(article.seo?.noIndex),
      },
    }));

    const importedAuthorName =
      article.author?.name || (typeof article.author === 'string' ? article.author : '');
    const matched = authors.find(
      (a) => a.name?.toLowerCase() === importedAuthorName.toLowerCase()
    );
    if (matched) {
      setSelectedAuthorId(matched.id);
    } else if (importedAuthorName) {
      setSelectedAuthorId('custom');
    }

    setAutoSlug(false);
    setImportModalOpen(false);
    setJsonInput('');
    setJsonError(null);
    toast.success('Data artikel berhasil dimuat ke formulir!');
  };

  // Upload Cover Image via 2-stage uploader dengan penamaan ramah SEO
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setErrorMessage(null);
    try {
      const coverSlug = formData.slug || slugify(formData.title) || 'blog-cover';
      const finalUrl = await uploadBlogImage(file, `${coverSlug}-cover`);
      setFormData((prev) => ({
        ...prev,
        coverImage: {
          ...prev.coverImage,
          url: finalUrl,
          alt: prev.coverImage.alt || prev.title,
        },
      }));
    } catch (err) {
      console.error('Gagal upload cover:', err);
      setErrorMessage(`Gagal mengunggah cover image: ${err.message}`);
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload Author Avatar via 2-stage uploader dengan penamaan ramah SEO
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setErrorMessage(null);
    try {
      const authorPrefix = formData.author?.name ? `avatar-${formData.author.name}` : 'avatar-author';
      const finalUrl = await uploadBlogImage(file, authorPrefix);
      setSelectedAuthorId('custom');
      setFormData((prev) => ({
        ...prev,
        author: {
          ...prev.author,
          avatar: finalUrl,
        },
        authorAvatar: finalUrl,
      }));
    } catch (err) {
      console.error('Gagal upload avatar:', err);
      setErrorMessage(`Gagal mengunggah foto avatar: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetSlug = slugify(formData.slug || formData.title);
    if (!formData.title.trim()) {
      setErrorMessage('Judul artikel wajib diisi.');
      return;
    }
    if (!targetSlug) {
      setErrorMessage('Slug URL tidak valid.');
      return;
    }
    if (!formData.content.trim()) {
      setErrorMessage('Konten Markdown artikel belum diisi.');
      return;
    }

    setSaving(true);
    try {
      const nowIso = new Date().toISOString();

      const tagsArray = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const keywordsArray = formData.seo?.keywords
        ? formData.seo.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title.trim(),
        slug: targetSlug,
        excerpt: formData.excerpt.trim(),
        category: formData.category,
        tags: tagsArray,
        readingTime: Number(formData.readingTime) || 5,
        status: formData.status,
        isFeatured: Boolean(formData.isFeatured),
        content: formData.content,
        coverImage: {
          url: formData.coverImage?.url || '',
          alt: formData.coverImage?.alt || formData.title,
          width: Number(formData.coverImage?.width) || 1200,
          height: Number(formData.coverImage?.height) || 630,
        },
        author: {
          name: formData.author?.name?.trim() || DEFAULT_AUTHOR.name,
          avatar: formData.author?.avatar?.trim() || DEFAULT_AUTHOR.avatar,
          bio: formData.author?.bio?.trim() || DEFAULT_AUTHOR.role,
          url: formData.author?.url?.trim() || DEFAULT_AUTHOR.url,
        },
        authorRole: formData.author?.bio?.trim() || formData.authorRole || DEFAULT_AUTHOR.role,
        authorAvatar: formData.author?.avatar?.trim() || formData.authorAvatar || DEFAULT_AUTHOR.avatar,
        seo: {
          metaTitle: formData.seo?.metaTitle || formData.title,
          metaDescription: formData.seo?.metaDescription || formData.excerpt,
          keywords: keywordsArray,
          canonicalUrl:
            formData.seo?.canonicalUrl || `https://sumestawsome.xyz/blog/${targetSlug}`,
          ogType: 'article',
          noIndex: Boolean(formData.seo?.noIndex),
        },
        updatedAt: nowIso,
        publishedAt: formData.publishedAt || nowIso,
        stats: formData.stats || { views: 0, likes: 0 },
      };

      const docRef = doc(db, 'posts', targetSlug);
      await setDoc(docRef, payload, { merge: true });

      setSuccessMessage('Artikel berhasil disimpan ke database!');
      setTimeout(() => {
        onNavigate('admin-blog');
      }, 1200);
    } catch (err) {
      console.error('Gagal menyimpan artikel:', err);
      setErrorMessage('Gagal menyimpan artikel ke Firestore: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      currentAdminView={isEditMode ? 'blog-edit' : 'blog-create'}
      onNavigate={onNavigate}
    >
      {/* Top Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('admin-blog')}
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Artikel
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {isEditMode ? `Edit Artikel: ${formData.title || initialSlug}` : 'Tulis Artikel Blog Baru'}
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setJsonError(null);
              setImportModalOpen(true);
            }}
            className="px-3.5 py-2 border border-semesta/50 hover:border-semesta text-semesta hover:text-white hover:bg-semesta font-mono text-xs rounded-none transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Impor metadata & konten artikel dari berkas JSON"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Impor dari JSON</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-blog')}
            className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono text-xs rounded-none transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || loadingPost}
            className="bg-semesta hover:bg-semesta/90 text-white font-semibold py-2 px-5 rounded-none text-xs sm:text-sm font-mono flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Artikel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/50 rounded-none text-red-400 text-xs sm:text-sm flex items-start gap-3 font-mono">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-none text-emerald-400 text-xs sm:text-sm flex items-start gap-3 font-mono">
          <Check className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      {loadingPost ? (
        <div className="border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-400 font-mono text-xs rounded-none flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-semesta animate-spin" />
          <span>Memuat data artikel...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Informasi Utama & Slug */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-none space-y-5">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-semesta border-b border-zinc-800 pb-2">
              1. Metadata Artikel & URL
            </h2>

            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                Judul Artikel <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="cth: Panduan Lengkap Cara Deploy Website ke Vercel"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3.5 py-2.5 rounded-none text-sm font-sans outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-semibold text-zinc-300">
                    Slug URL (SEO Friendly) <span className="text-red-400">*</span>
                  </label>
                  <label className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                      className="accent-semesta"
                    />
                    <span>Otomatis dari judul</span>
                  </label>
                </div>
                <div className="flex items-center bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-none">
                  <span className="text-zinc-500 font-mono text-xs select-none">/blog/</span>
                  <input
                    type="text"
                    required
                    disabled={autoSlug}
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))
                    }
                    className="bg-transparent text-semesta font-mono text-xs sm:text-sm w-full outline-none disabled:text-zinc-400"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  list="category-suggestions"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs sm:text-sm font-mono rounded-none outline-none"
                />
                <datalist id="category-suggestions">
                  <option value="Deployment & DevOps" />
                  <option value="Web Development" />
                  <option value="Frontend Engineering" />
                  <option value="UI/UX & Visual" />
                  <option value="Tutorial" />
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                Ringkasan Singkat (Excerpt) <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Ringkasan 1-2 kalimat untuk kartu blog dan meta description Google..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-zinc-200 px-3.5 py-2.5 rounded-none text-xs sm:text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Tag Artikel (Pisahkan koma)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="Vercel, Next.js, CI/CD"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Status Publikasi
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none"
                >
                  <option value="published">Published (Tayang Publik)</option>
                  <option value="draft">Draft (Disimpan Sementara)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                  Sorotan Unggulan
                </label>
                <label className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-none cursor-pointer text-xs font-mono text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                    }
                    className="accent-semesta"
                  />
                  <span>Tampilkan di Baris Unggulan</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Upload Gambar Cover */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-none space-y-5">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-semesta border-b border-zinc-800 pb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> 2. Gambar Cover (WebP 1200x630 via Cloudinary & CDN)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Preview Box */}
              <div className="md:col-span-5 border border-zinc-800 bg-zinc-950 aspect-[16/9] flex items-center justify-center relative overflow-hidden rounded-none">
                {formData.coverImage?.url ? (
                  <img
                    src={formData.coverImage.url}
                    alt="Preview Cover"
                    className="w-full h-full object-cover rounded-none"
                  />
                ) : (
                  <div className="text-center p-4 text-zinc-600 font-mono text-xs">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                    <span>Belum ada gambar cover</span>
                  </div>
                )}
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 text-xs font-mono text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-semesta" />
                    <span>Mengunggah ke CDN...</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-2">
                    Unggah Berkas Baru (Cloudinary ➔ Rumahweb CDN)
                  </label>
                  <label className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs py-2.5 px-4 rounded-none cursor-pointer border border-zinc-700 transition-colors">
                    <Upload className="w-4 h-4 text-semesta" />
                    <span>Pilih Berkas Gambar (PNG, JPG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                    Atau Masukkan URL Gambar Langsung
                  </label>
                  <input
                    type="url"
                    value={formData.coverImage?.url || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        coverImage: { ...prev.coverImage, url: e.target.value },
                      }))
                    }
                    placeholder="https://cdn.sumestawsome.xyz/uploads/..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                    Teks Alternatif Gambar (Alt SEO)
                  </label>
                  <input
                    type="text"
                    value={formData.coverImage?.alt || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        coverImage: { ...prev.coverImage, alt: e.target.value },
                      }))
                    }
                    placeholder="Deskripsi gambar untuk pembaca tuna netra & Google Image"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Editor Konten Markdown & Live Preview */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-semesta flex items-center gap-2">
                <FileCode className="w-4 h-4" /> 3. Konten Artikel (Markdown)
              </h2>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-none font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setEditorTab('write')}
                  className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${
                    editorTab === 'write' ? 'bg-semesta text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Editor Tulis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('preview')}
                  className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${
                    editorTab === 'preview' ? 'bg-semesta text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            {editorTab === 'write' ? (
              <div>
                <textarea
                  rows={20}
                  required
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="# Tulis artikel Anda di sini menggunakan format Markdown...&#10;&#10;## Subheading 1&#10;Isi paragraf artikel...&#10;&#10;```javascript&#10;console.log('Halo Sumestawsome!');&#10;```"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-zinc-100 p-4 font-mono text-xs sm:text-sm leading-relaxed rounded-none outline-none resize-y"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-2">
                  <span>Mendukung sintaks CommonMark & GitHub Flavored Markdown (GFM).</span>
                  <span>Estimasi baca: ~{formData.readingTime} menit</span>
                </div>
              </div>
            ) : (
              <div className="bg-white text-zinc-900 p-6 sm:p-8 border border-zinc-300 rounded-none min-h-[450px] overflow-y-auto max-h-[700px]">
                <div className="blog-content font-sans">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-zinc-200 text-zinc-900">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-6 mb-3 text-zinc-900">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-base leading-relaxed text-zinc-700 mb-4">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 space-y-1.5 mb-4 marker:text-semesta">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 space-y-1.5 mb-4 marker:text-semesta">{children}</ol>
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
                            className="bg-zinc-100 text-semesta font-mono text-xs px-1.5 py-0.5 rounded-none border border-zinc-300 break-words"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-semesta underline underline-offset-4 hover:opacity-80"
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-semesta pl-4 py-2 italic my-4 text-zinc-600 bg-zinc-50">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {formData.content || '_Belum ada konten untuk dipratinjau._'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Info Penulis & Pengaturan SEO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Penulis Box (Collapsible / Opsional) */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-none space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-semesta" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-semesta">
                    4. Profil Penulis
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthorSettingsOpen(!authorSettingsOpen)}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{authorSettingsOpen ? 'Tutup Pengaturan' : 'Kustomisasi Profil'}</span>
                  {authorSettingsOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Dropdown Pemilihan Cepat Profil */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-semibold text-zinc-300">
                    Pilih Profil Penulis
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('admin-authors')}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-semesta hover:underline underline-offset-4 cursor-pointer"
                    title="Buka Halaman Kelola Penulis"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Kelola Penulis</span>
                  </button>
                </div>
                <select
                  value={selectedAuthorId}
                  onChange={(e) => handleAuthorSelect(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none font-mono cursor-pointer"
                >
                  {authors.length > 0 ? (
                    authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name} {author.role ? `(${author.role})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="admin">Admin Sumesta (Full-stack developer)</option>
                  )}
                  <option value="custom">Kustom (Isi Manual)</option>
                </select>
              </div>

              {/* Status Ringkas Penulis Otomatis */}
              <div className="flex items-center gap-3.5 bg-zinc-950 p-3 border border-zinc-800/80 rounded-none">
                {formData.author?.avatar || formData.authorAvatar ? (
                  <img
                    src={formData.author?.avatar || formData.authorAvatar}
                    alt={formData.author?.name || 'Admin'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      const authorName = formData.author?.name || 'Admin';
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        authorName
                      )}&background=2563eb&color=fff&bold=true`;
                    }}
                    className="w-10 h-10 object-cover border border-zinc-700 rounded-none bg-zinc-800 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-semesta text-white font-mono font-bold flex items-center justify-center text-xs rounded-none flex-shrink-0">
                    S
                  </div>
                )}
                <div className="min-w-0 flex-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {formData.author?.name || DEFAULT_AUTHOR.name}
                    </span>
                    <span className="text-[10px] text-semesta bg-semesta/10 border border-semesta/20 px-1.5 py-0.5 rounded-none font-semibold">
                      {selectedAuthorId === 'custom' ? 'Kustom' : 'Tersinkron'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {formData.author?.bio || formData.authorRole || DEFAULT_AUTHOR.role}
                  </p>
                </div>
              </div>

              {/* Form Input Kustomisasi Profil (Tersembunyi secara Default) */}
              {authorSettingsOpen && (
                <div className="space-y-4 pt-2 border-t border-zinc-800/60">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                      Nama Penulis
                    </label>
                    <input
                      type="text"
                      value={formData.author?.name || ''}
                      onChange={(e) => {
                        setSelectedAuthorId('custom');
                        setFormData((prev) => ({
                          ...prev,
                          author: { ...prev.author, name: e.target.value },
                        }));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                      Bio Ringkas
                    </label>
                    <input
                      type="text"
                      value={formData.author?.bio || ''}
                      onChange={(e) => {
                        setSelectedAuthorId('custom');
                        setFormData((prev) => ({
                          ...prev,
                          author: { ...prev.author, bio: e.target.value },
                          authorRole: e.target.value,
                        }));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                      Tautan Profil (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.author?.url || ''}
                      onChange={(e) => {
                        setSelectedAuthorId('custom');
                        setFormData((prev) => ({
                          ...prev,
                          author: { ...prev.author, url: e.target.value },
                        }));
                      }}
                      placeholder="https://sumestawsome.xyz"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                      Foto Avatar Penulis (Opsional)
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs py-2 px-3 rounded-none cursor-pointer border border-zinc-700 transition-colors flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-semesta" />
                          <span>Ganti Foto Avatar</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              setSelectedAuthorId('custom');
                              handleAvatarUpload(e);
                            }}
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
                        value={formData.author?.avatar || ''}
                        onChange={(e) => {
                          setSelectedAuthorId('custom');
                          setFormData((prev) => ({
                            ...prev,
                            author: { ...prev.author, avatar: e.target.value },
                            authorAvatar: e.target.value,
                          }));
                        }}
                        placeholder="https://ui-avatars.com/api/?name=..."
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEO Settings Box */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-none space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-semesta border-b border-zinc-800 pb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> 5. Optimasi Mesin Pencari (SEO)
              </h2>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                  Meta Title (Google SERP)
                </label>
                <input
                  type="text"
                  value={formData.seo?.metaTitle || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaTitle: e.target.value },
                    }))
                  }
                  placeholder="Judul khusus pencarian Google (50-60 karakter)"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={formData.seo?.metaDescription || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaDescription: e.target.value },
                    }))
                  }
                  placeholder="Deskripsi rangkuman untuk snippet mesin pencari..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs rounded-none outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                  Kata Kunci Target (Keywords)
                </label>
                <input
                  type="text"
                  value={formData.seo?.keywords || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, keywords: e.target.value },
                    }))
                  }
                  placeholder="deploy vercel, nextjs tutorial, github action"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-white px-3 py-2 text-xs font-mono rounded-none outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Button Bar */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('admin-blog')}
              className="px-5 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono text-xs rounded-none transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-semesta hover:bg-semesta/90 text-white font-semibold py-2.5 px-6 rounded-none text-xs sm:text-sm font-mono flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Artikel Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Modal Dialog Impor Cepat dari JSON */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 text-white w-full max-w-2xl rounded-none shadow-none p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                  ⚡ Impor Artikel dari Format JSON
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  setJsonError(null);
                }}
                className="text-zinc-400 hover:text-white p-1 transition-colors rounded-none cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Tempelkan format JSON artikel di bawah ini (objek JSON atau array). Nilai judul, slug, kategori, tag, ringkasan, dan konten Markdown akan otomatis diterapkan ke formulir editor.
            </p>

            {jsonError && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-none text-red-400 text-xs flex items-start gap-2 font-mono">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1">{jsonError}</div>
              </div>
            )}

            <div className="flex-1 min-h-[220px]">
              <textarea
                rows={12}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`{\n  "title": "Panduan Lengkap...",\n  "slug": "panduan-lengkap",\n  "category": "Deployment & DevOps",\n  "tags": ["Cloudflare", "React"],\n  "excerpt": "Ringkasan artikel...",\n  "content": "# Konten Markdown..."\n}`}
                className="w-full h-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-zinc-200 p-3.5 font-mono text-xs leading-relaxed rounded-none outline-none resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  setJsonError(null);
                }}
                className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono text-xs rounded-none transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleApplyJsonImport}
                className="bg-semesta hover:bg-semesta/90 text-white font-semibold py-2 px-5 rounded-none text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Terapkan ke Form</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sonner Toast Notification */}
      <Toaster
        position="top-right"
        richColors
        theme="dark"
        toastOptions={{
          style: { borderRadius: '0px' },
          className: 'font-mono text-xs rounded-none',
        }}
      />
    </AdminLayout>
  );
}
