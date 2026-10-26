import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { updateMetaTags } from '../../utils/seo';
import karyaData from '../../data/karya.json';
import PageHeader from '../../components/PageHeader';
import { Loader2, Star, FolderGit2 } from 'lucide-react';

const PAGE_SIZE = 9;

function ExternalLinkIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function GridIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export default function Karya({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [projects, setProjects] = useState([]);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [localOffset, setLocalOffset] = useState(PAGE_SIZE);

  const categories = [
    'Semua',
    'Web Development',
    'Desain Grafis',
    'Multimedia',
    'UI/UX Design',
  ];

  // Helper normalisasi dokumen Firestore ke bentuk objek kartu karya
  const mapDocToProject = (docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      slug: data.slug || docSnap.id,
      title: data.title || '',
      category: data.category || 'Web Development',
      badge: data.badge || '',
      desc: data.excerpt || data.description || '',
      thumbnail: data.coverImage || data.thumbnail || '',
      tools: Array.isArray(data.tags) ? data.tags : (Array.isArray(data.tools) ? data.tools : []),
      link: data.demoUrl || data.projectUrl || data.link || '#',
      isFeatured: Boolean(data.isFeatured),
      order: Number(data.order) || 99,
    };
  };

  // Muat batch pertama setiap kali kategori berubah
  const fetchInitialProjects = useCallback(async (cat) => {
    setLoading(true);
    setHasMore(true);
    setLastVisibleDoc(null);

    if (!isFirebaseConfigured || !db) {
      // Fallback lokal jika Firestore offline
      setIsUsingFallback(true);
      const filtered = cat === 'Semua' 
        ? karyaData 
        : karyaData.filter((k) => k.category === cat);
      setProjects(filtered.slice(0, PAGE_SIZE));
      setLocalOffset(PAGE_SIZE);
      setHasMore(filtered.length > PAGE_SIZE);
      setLoading(false);
      return;
    }

    try {
      let q;
      if (cat === 'Semua') {
        q = query(
          collection(db, 'projects'),
          orderBy('order', 'asc'),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          collection(db, 'projects'),
          where('category', '==', cat),
          limit(PAGE_SIZE)
        );
      }

      const snap = await getDocs(q);

      if (!snap.empty) {
        let items = snap.docs.map(mapDocToProject);
        if (cat !== 'Semua') {
          items.sort((a, b) => a.order - b.order);
        }
        setProjects(items);
        setLastVisibleDoc(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.docs.length === PAGE_SIZE);
        setIsUsingFallback(false);
      } else {
        // Jika koleksi Firestore belum terisi atau kategori kosong
        setProjects([]);
        setLastVisibleDoc(null);
        setHasMore(false);
      }
    } catch (err) {
      console.warn('[Karya] Gagal memuat proyek dari Firestore, menggunakan data lokal:', err);
      setIsUsingFallback(true);
      const filtered = cat === 'Semua' 
        ? karyaData 
        : karyaData.filter((k) => k.category === cat);
      setProjects(filtered.slice(0, PAGE_SIZE));
      setLocalOffset(PAGE_SIZE);
      setHasMore(filtered.length > PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cleanup = updateMetaTags({
      title: 'Galeri Karya & Portofolio Rekayasa Web | Sumestawsome',
      description:
        'Eksplorasi pilihan proyek rekayasa web modern, perancangan antarmuka visual, dan multimedia kreatif dari Putu Agus Sumerta (sumestawsome).',
      canonical: 'https://sumestawsome.xyz/karya',
      ogImage:
        'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791253452/Screenshot_2026-10-06_102344_sx1sey.png',
      ogType: 'website',
    });
    return cleanup;
  }, []);

  useEffect(() => {
    fetchInitialProjects(selectedCategory);
  }, [selectedCategory, fetchInitialProjects]);

  // Muat batch berikutnya (Pagination dengan startAfter)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    if (isUsingFallback) {
      // Pagination data lokal
      const filtered = selectedCategory === 'Semua' 
        ? karyaData 
        : karyaData.filter((k) => k.category === selectedCategory);
      const nextBatch = filtered.slice(localOffset, localOffset + PAGE_SIZE);
      setProjects((prev) => [...prev, ...nextBatch]);
      const newOffset = localOffset + PAGE_SIZE;
      setLocalOffset(newOffset);
      if (newOffset >= filtered.length) {
        setHasMore(false);
      }
      setLoadingMore(false);
      return;
    }

    try {
      if (!lastVisibleDoc) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      let q;
      if (selectedCategory === 'Semua') {
        q = query(
          collection(db, 'projects'),
          orderBy('order', 'asc'),
          startAfter(lastVisibleDoc),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          collection(db, 'projects'),
          where('category', '==', selectedCategory),
          startAfter(lastVisibleDoc),
          limit(PAGE_SIZE)
        );
      }

      const snap = await getDocs(q);

      if (!snap.empty) {
        let newItems = snap.docs.map(mapDocToProject);
        if (selectedCategory !== 'Semua') {
          newItems.sort((a, b) => a.order - b.order);
        }
        setProjects((prev) => [...prev, ...newItems]);
        setLastVisibleDoc(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.docs.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[Karya] Gagal memuat batch berikutnya:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-6 md:pt-8 pb-16 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <PageHeader
          onNavigate={onNavigate}
          badgeText="KATALOG PORTOFOLIO"
          badgeIcon={<GridIcon className="w-3.5 h-3.5" />}
          title="Galeri Karya & Proyek"
          subtitle="Eksplorasi pilihan dalam pengembangan web modern, perancangan antarmuka pengguna, dan identitas visual berbasis standar industri."
        />

        {/* Filter Kategori */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-none border transition-colors shadow-none ${
                  isActive
                    ? 'bg-semesta text-white border-semesta'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200 p-4 rounded-none flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="aspect-video w-full bg-slate-200 rounded-none mb-4" />
                  <div className="h-4 bg-slate-200 rounded-none w-1/4 mb-3" />
                  <div className="h-6 bg-slate-200 rounded-none w-3/4 mb-3" />
                  <div className="h-12 bg-slate-200 rounded-none w-full mb-4" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-slate-200 rounded-none w-16" />
                    <div className="h-5 bg-slate-200 rounded-none w-20" />
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <div className="h-8 bg-slate-200 rounded-none w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Grid Responsif 3x3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id || project.slug}
                  className="bg-white border border-slate-200 p-4 rounded-none flex flex-col justify-between hover:border-slate-400 transition shadow-none group"
                >
                  <div>
                    {/* Thumbnail 16:9 */}
                    <div className="aspect-video w-full overflow-hidden rounded-none bg-slate-100 relative border border-slate-200/80 mb-4">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover rounded-none transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                          <FolderGit2 className="w-8 h-8 opacity-40 mb-1" />
                        </div>
                      )}
                    </div>

                    {/* Badge Kategori & Bintang */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-semibold text-semesta uppercase tracking-wider">
                        {project.category}
                      </span>
                      {project.isFeatured && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-none shadow-none">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                          <span>Terpilih</span>
                        </span>
                      )}
                    </div>

                    {/* Judul Proyek */}
                    <h3 className="text-[17px] font-bold text-slate-900 leading-snug mb-2">
                      {project.title}
                    </h3>

                    {/* Deskripsi Singkat */}
                    <p className="text-[13px] sm:text-[14px] text-slate-600 leading-relaxed mb-4 line-clamp-3">
                      {project.desc}
                    </p>

                    {/* Tools / Alat */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {project.tools.map((tool, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-none border border-slate-200 font-mono"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tombol Aksi di Kanan Bawah */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-semesta hover:opacity-90 text-white text-xs font-semibold px-3.5 py-2 rounded-none inline-flex items-center gap-1.5 transition shadow-none"
                    >
                      <span>Lihat Proyek</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
              <div className="bg-white border border-slate-200 p-12 text-center rounded-none my-8 shadow-none">
                <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-slate-900 font-bold text-base mb-1">
                  Belum Ada Proyek
                </h4>
                <p className="text-slate-600 font-normal text-sm max-w-sm mx-auto">
                  Tidak ada proyek yang ditemukan untuk kategori "{selectedCategory}".
                </p>
              </div>
            )}

            {/* Load More Pagination Button */}
            {projects.length > 0 && (
              <div className="mt-12 text-center">
                {hasMore ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-none transition-colors shadow-none disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-semesta" />
                        <span>Memuat Karya Berikutnya...</span>
                      </>
                    ) : (
                      <span>Muat Lebih Banyak ({PAGE_SIZE} Karya)</span>
                    )}
                  </button>
                ) : (
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                    Menampilkan seluruh {projects.length} karya dalam kategori ini
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
