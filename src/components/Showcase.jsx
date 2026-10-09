import { projects } from '../data/projects';
import { ExternalLink, Sparkles, FolderGit2 } from 'lucide-react';

export default function Showcase() {
  return (
    <section id="karya" className="py-16 md:py-24 bg-slate-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-semesta bg-semesta/10 px-3 py-1 border border-semesta/20 mb-3">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>PORTFOLIO SHOWCASE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Karya Terpilih & Eksplorasi Nyata
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-md">
            Mulai dari motion graphic naratif, digital imaging Photoshop, hingga aplikasi web
            interaktif berbasis React.
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-slate-200 bg-white flex flex-col justify-between hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow group overflow-hidden"
            >
              <div>
                {/* 16:9 Landscape Image Preview */}
                <div className="aspect-video w-full overflow-hidden border-b border-slate-200 bg-slate-100 relative">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-semesta bg-white/95 px-2.5 py-1 border border-semesta/20 backdrop-blur-sm shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>{project.badge}</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Category */}
                  <div className="mb-2">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {project.category}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {project.description}
                  </p>

                  {/* Tools / Tech Stack */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {project.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 border border-slate-200"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-semesta text-white text-sm font-semibold transition-colors border border-transparent"
                >
                  <span>Lihat Detail Proyek</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
