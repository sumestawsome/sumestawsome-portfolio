import { Clock, Calendar, ArrowRight } from 'lucide-react';

export default function BlogCard({ post, onNavigate = () => {}, isFeatured = false }) {
  if (!post) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    onNavigate('blog-detail', post.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isFeatured) {
    return (
      <article className="border-2 border-semesta bg-white p-6 sm:p-8 rounded-none mb-10 transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Cover Image */}
          <div className="lg:col-span-7">
            <a
              href={`/blog/${post.slug}`}
              onClick={handleCardClick}
              className="block group overflow-hidden border border-zinc-200 aspect-[16/9] bg-zinc-100 rounded-none relative"
            >
              <img
                src={post.coverImage?.url || (typeof post.coverImage === 'string' ? post.coverImage : 'https://placehold.co/1200x630?text=Artikel')}
                alt={post.coverImage?.alt || post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-none"
                loading="eager"
              />
              <span className="absolute top-3 left-3 bg-semesta text-white font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none">
                Unggulan
              </span>
            </a>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-semesta/10 text-semesta border border-semesta/20 text-xs font-semibold px-2.5 py-0.5 rounded-none">
                  {post.category || 'Teknologi'}
                </span>
                <span className="text-zinc-400 text-xs">•</span>
                <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-semesta" /> {post.readingTime || 5} mnt baca
                </span>
              </div>

              <a href={`/blog/${post.slug}`} onClick={handleCardClick} className="block group">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 group-hover:text-semesta transition-colors leading-tight mb-3">
                  {post.title}
                </h2>
              </a>

              <p className="text-sm sm:text-base text-zinc-600 line-clamp-3 leading-relaxed mb-6 font-normal">
                {post.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {post.author?.avatar || post.authorAvatar ? (
                  <img
                    src={post.author?.avatar || post.authorAvatar}
                    alt={post.author?.name || 'Admin Sumesta'}
                    className="w-7 h-7 rounded-none border border-zinc-300 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 bg-semesta text-white text-xs font-bold flex items-center justify-center rounded-none">
                    {post.author?.name ? post.author.name[0] : (typeof post.author === 'string' ? post.author[0] : 'S')}
                  </div>
                )}
                <div className="text-xs">
                  <p className="font-semibold text-zinc-900">{post.author?.name || (typeof post.author === 'string' ? post.author : 'Admin Sumesta')}</p>
                  <p className="text-zinc-500 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}
                  </p>
                </div>
              </div>

              <a
                href={`/blog/${post.slug}`}
                onClick={handleCardClick}
                className="inline-flex items-center gap-1 text-xs font-bold text-semesta hover:underline underline-offset-4"
              >
                Baca Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="border border-zinc-200 bg-white hover:border-semesta/50 transition-colors flex flex-col justify-between rounded-none group h-full">
      <div>
        {/* Cover Image */}
        <a
          href={`/blog/${post.slug}`}
          onClick={handleCardClick}
          className="block overflow-hidden border-b border-zinc-200 aspect-[16/9] bg-zinc-100 rounded-none relative"
        >
          <img
            src={post.coverImage?.url || (typeof post.coverImage === 'string' ? post.coverImage : 'https://placehold.co/600x338?text=Artikel')}
            alt={post.coverImage?.alt || post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-none"
            loading="lazy"
          />
          <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur text-semesta border border-semesta/20 text-[10px] font-bold px-2 py-0.5 rounded-none font-mono">
            {post.category || 'Artikel'}
          </span>
        </a>

        {/* Card Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-semesta" /> {formatDate(post.publishedAt)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-semesta" /> {post.readingTime || 5} mnt
            </span>
          </div>

          <a href={`/blog/${post.slug}`} onClick={handleCardClick} className="block">
            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-semesta transition-colors leading-snug mb-2 line-clamp-2">
              {post.title}
            </h3>
          </a>

          <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed mb-4">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
        <span className="text-zinc-600 font-medium">{post.author?.name || (typeof post.author === 'string' ? post.author : 'Admin Sumesta')}</span>
        <a
          href={`/blog/${post.slug}`}
          onClick={handleCardClick}
          className="text-semesta font-semibold group-hover:underline inline-flex items-center gap-1 underline-offset-4"
        >
          Baca <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}
