import { useState } from 'react';
import karyaData from '../../data/karya.json';
import PageHeader from '../../components/PageHeader';

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

  const categories = [
    'Semua',
    'Web Development',
    'Desain Grafis',
    'Multimedia',
    'UI/UX Design',
  ];

  const filteredProjects =
    selectedCategory === 'Semua'
      ? karyaData
      : karyaData.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-100 pt-6 md:pt-8 pb-14 md:pb-16">
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
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-none border transition-colors ${
                  isActive
                    ? 'bg-semesta text-white border-semesta shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid Responsif */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200 p-4 rounded-none flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {/* Thumbnail 16:9 */}
                <div className="aspect-video w-full overflow-hidden rounded-none bg-[#cbe3f7] relative border border-slate-200/80 mb-4">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover rounded-none transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Badge Kategori */}
                <div className="mb-1.5">
                  <span className="text-xs font-mono font-semibold text-semesta uppercase tracking-wider">
                    {project.category}
                  </span>
                </div>

                {/* Judul Proyek */}
                <h3 className="text-[18px] font-bold text-slate-900 leading-snug mb-2">
                  {project.title}
                </h3>

                {/* Deskripsi Singkat */}
                <p className="text-[13px] sm:text-[14px] text-slate-600 leading-relaxed mb-4">
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
                  className="bg-semesta hover:opacity-90 text-white text-xs font-semibold px-3 py-2 rounded-none inline-flex items-center gap-1.5 transition"
                >
                  <span>Lihat Proyek</span>
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="bg-white border border-slate-200 p-12 text-center rounded-none my-8">
            <p className="text-slate-600 font-medium text-sm">
              Tidak ada proyek yang ditemukan untuk kategori ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
