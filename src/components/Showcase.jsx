import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { projects as fallbackProjects } from '../data/projects';
import { ExternalLink, Star, FolderGit2 } from 'lucide-react';

export default function Showcase() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchFeaturedProjects() {
      if (!isFirebaseConfigured || !db) {
        setFeaturedProjects(fallbackProjects);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'projects'),
          where('isFeatured', '==', true)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docs = [];
          querySnapshot.forEach((docSnap) => {
            docs.push({ id: docSnap.id, ...docSnap.data() });
          });
          // Urutkan berdasarkan field order jika ada
          docs.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
          const topProjects = docs.slice(0, 6);
          if (isMounted) {
            setFeaturedProjects(topProjects);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setFeaturedProjects(fallbackProjects);
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn('[Showcase] Gagal memuat karya terpilih dari Firestore, beralih ke data lokal:', err);
        if (isMounted) {
          setFeaturedProjects(fallbackProjects);
          setLoading(false);
        }
      }
    }

    fetchFeaturedProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayList = featuredProjects.length > 0 ? featuredProjects : fallbackProjects;
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
          {displayList.map((project) => {
            const projectImg = project.coverImage || project.image;
            const projectTags = Array.isArray(project.tags) && project.tags.length > 0 
              ? project.tags 
              : (Array.isArray(project.tools) ? project.tools : []);
            const projectLink = project.demoUrl || project.projectUrl || project.url || '#';

            return (
              <div
                key={project.id || project.slug}
                className="border border-slate-200 bg-white flex flex-col justify-between hover:border-slate-400 transition-all duration-200 shadow-none hover:shadow-none group overflow-hidden rounded-none"
              >
                <div>
                  {/* 16:9 Landscape Image Preview */}
                  <div className="aspect-video w-full overflow-hidden border-b border-slate-200 bg-slate-100 relative rounded-none">
                    <img
                      src={projectImg}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-none"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Category & Terpilih */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {project.category}
                      </span>
                      {(project.isFeatured !== false) && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-none shadow-none">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                          <span>Terpilih</span>
                        </span>
                      )}
                    </div>

                    {/* Project Title */}
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                      {project.description || project.excerpt}
                    </p>

                    {/* Tools / Tech Stack */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {projectTags.map((tool, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 border border-slate-200 rounded-none"
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
                    href={projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-semesta text-white text-sm font-semibold transition-colors border border-transparent rounded-none shadow-none"
                  >
                    <span>Lihat Detail Proyek</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
