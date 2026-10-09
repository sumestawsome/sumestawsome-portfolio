export default function PageHeader({
  backLink = '/',
  backText = 'Kembali ke Beranda',
  badgeText,
  badgeIcon,
  title,
  subtitle,
  onNavigate,
}) {
  const handleBack = (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-8">
      {/* Baris Atas */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <a
          href={backLink}
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition rounded-none shadow-xs"
        >
          <span>←</span>
          <span>{backText}</span>
        </a>

        {badgeText && (
          <div className="bg-semesta/10 text-semesta border border-semesta/20 text-[11px] font-bold px-2.5 py-1 tracking-wider uppercase inline-flex items-center gap-1.5 rounded-none font-mono">
            {badgeIcon}
            <span>{badgeText}</span>
          </div>
        )}
      </div>

      {/* Baris Bawah (Judul & Subtitle) */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mt-2 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
