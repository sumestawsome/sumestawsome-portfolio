import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function BlogSidebarCta({ onNavigate = () => {} }) {
  const waUrl =
    'https://wa.me/6285119459703?text=Halo%20Mas%20Agus,%20saya%20membaca%20artikel%20blog%20dan%20tertarik%20konsultasi%20layanan';

  return (
    <div className="border-2 border-semesta p-6 bg-semesta/5 dark:bg-semesta/10 rounded-none relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 bg-semesta inline-block" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-semesta flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Kolaborasi Proyek
        </span>
      </div>

      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug mb-2">
        Butuh Solusi Desain Visual & Web?
      </h3>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
        Konsultasikan proyek visual branding, motion graphics, atau pembuatan website modern bersama
        Sumestawsome.
      </p>

      <div className="space-y-2.5">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-semesta hover:bg-semesta/90 text-white font-semibold py-2.5 px-4 text-center block rounded-none text-sm transition-colors flex items-center justify-center gap-1.5 group"
        >
          <span>Konsultasi via WhatsApp</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        <button
          type="button"
          onClick={() => {
            onNavigate('layanan');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full border border-semesta/30 hover:border-semesta text-semesta font-semibold py-2 px-4 text-center block rounded-none text-xs transition-colors bg-white/60 dark:bg-zinc-900/60"
        >
          Lihat Paket Layanan & Harga
        </button>
      </div>
    </div>
  );
}
