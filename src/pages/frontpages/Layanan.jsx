import { useState } from 'react';
import layananData from '../../data/layanan.json';
import PageHeader from '../../components/PageHeader';

function TagIcon({ className = 'w-3.5 h-3.5' }) {
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
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function PaletteIcon({ className = 'w-5 h-5' }) {
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
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
    </svg>
  );
}

function VideoIcon({ className = 'w-5 h-5' }) {
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
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
      <rect x="2" y="6" width="14" height="12" rx="0" />
    </svg>
  );
}

function CodeIcon({ className = 'w-5 h-5' }) {
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
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function getPillarIcon(pillar, className = 'w-5 h-5') {
  if (pillar === 'Desain Grafis') return <PaletteIcon className={className} />;
  if (pillar === 'Video & Motion') return <VideoIcon className={className} />;
  return <CodeIcon className={className} />;
}

function CheckIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ShieldIcon({ className = 'w-4 h-4' }) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LayersIcon({ className = 'w-4 h-4' }) {
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
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function ListIcon({ className = 'w-4 h-4' }) {
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
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.3C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM9.11 7.42C8.94 7.42 8.66 7.48 8.42 7.74C8.18 8 7.5 8.64 7.5 9.94C7.5 11.24 8.45 12.5 8.58 12.67C8.72 12.85 10.45 15.5 13.1 16.65C15.31 17.61 15.76 17.42 16.23 17.38C16.71 17.34 17.77 16.75 17.99 16.14C18.21 15.53 18.21 15.01 18.15 14.9C18.09 14.79 17.92 14.73 17.66 14.6C17.4 14.47 16.14 13.85 15.91 13.76C15.68 13.67 15.51 13.63 15.34 13.89C15.17 14.15 14.68 14.73 14.53 14.9C14.38 15.07 14.23 15.1 13.97 14.97C13.71 14.84 12.88 14.57 11.89 13.69C11.12 13 10.6 12.14 10.45 11.88C10.3 11.62 10.43 11.48 10.56 11.35C10.68 11.23 10.83 11.04 10.97 10.88C11.11 10.72 11.15 10.6 11.24 10.42C11.33 10.24 11.29 10.09 11.22 9.96C11.15 9.83 10.64 8.58 10.43 8.06C10.22 7.56 10.01 7.62 9.85 7.61C9.7 7.61 9.53 7.6 9.36 7.6C9.19 7.6 8.94 7.42 9.11 7.42Z" />
    </svg>
  );
}

export default function Layanan({ onNavigate }) {
  // Mode View: 'paket' (Skema Paket Bertingkat) | 'reguler' (Tarif Satuan A La Carte)
  const [viewMode, setViewMode] = useState('paket');
  const [selectedPillar, setSelectedPillar] = useState('Semua');

  // Form State
  const [kebutuhan, setKebutuhan] = useState('');
  const [tujuan, setTujuan] = useState('Tugas Kuliah / Kampus');
  const [formatOutput, setFormatOutput] = useState('File Siap Cetak JPG/PNG HD');
  const [pilihanPaket, setPilihanPaket] = useState('Desain Grafis Deluxe (Rp 65.000 – Rp 85.000)');
  const [deadline, setDeadline] = useState('Kilat (1–2 Hari)');
  const [catatan, setCatatan] = useState('');

  const pillars = ['Semua', 'Desain Grafis', 'Video & Motion', 'Web Frontend'];

  const { paket_bertingkat, tarif_reguler, ketentuan_layanan } = layananData;

  // Filter paket bertingkat
  const filteredPaket =
    selectedPillar === 'Semua'
      ? paket_bertingkat
      : paket_bertingkat.filter((item) => item.pillar === selectedPillar);

  // Filter tarif reguler
  const filteredReguler =
    selectedPillar === 'Semua'
      ? tarif_reguler
      : tarif_reguler.filter((item) => item.pillar === selectedPillar);

  const handlePilihPaket = (name, price) => {
    setPilihanPaket(`${name} (${price})`);
    const formElement = document.getElementById('brief-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKirimWhatsApp = (e) => {
    e.preventDefault();

    const textKebutuhan = kebutuhan.trim() || 'Konsultasi Proyek Kreatif';
    const textCatatan = catatan.trim() || '-';

    const messageText = `Halo Sumesta, saya ingin konsultasi pengerjaan proyek:
- Kebutuhan: ${textKebutuhan}
- Tujuan: ${tujuan}
- Format Output: ${formatOutput}
- Pilihan Paket: ${pilihanPaket}
- Deadline: ${deadline}
- Catatan Khusus: ${textCatatan}

Apakah jadwalnya tersedia untuk pengerjaan ini?`;

    const waUrl = `https://wa.me/6285119459703?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-6 md:pt-8 pb-14 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <PageHeader
          onNavigate={onNavigate}
          badgeText="LAYANAN & TARIF"
          badgeIcon={<TagIcon className="w-3.5 h-3.5" />}
          title="Pilihan Layanan & Estimasi Tarif"
          subtitle="Solusi visual, motion, dan rekayasa web siap pakai dengan alur konsultasi transparan."
        />

        {/* Navigasi Mode Tampilan (Skema Paket vs Tarif Satuan) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="inline-flex w-full sm:w-auto p-1 bg-white border border-slate-200 rounded-none shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('paket')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-none transition-colors ${
                viewMode === 'paket'
                  ? 'bg-semesta text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayersIcon className="w-4 h-4" />
              <span>Skema Paket</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('reguler')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-none transition-colors ${
                viewMode === 'reguler'
                  ? 'bg-semesta text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ListIcon className="w-4 h-4" />
              <span>Tarif Satuan</span>
            </button>
          </div>

          <span className="text-xs font-mono text-slate-500 self-start sm:self-center">
            Mode Aktif: <strong className="text-slate-800">{viewMode === 'paket' ? '9 Paket Bertingkat' : 'Tarif Satuan Lepas'}</strong>
          </span>
        </div>

        {/* Filter Pilar Layanan */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {pillars.map((pillar) => {
            const isActive = selectedPillar === pillar;
            return (
              <button
                key={pillar}
                type="button"
                onClick={() => setSelectedPillar(pillar)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-none border transition-colors ${
                  isActive
                    ? 'bg-semesta text-white border-semesta shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {pillar}
              </button>
            );
          })}
        </div>

        {/* TAMPILAN 1: GRID KARTU PAKET BERTINGKAT (9 PAKET) */}
        {viewMode === 'paket' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredPaket.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => handlePilihPaket(pkg.nama_paket, pkg.range_harga)}
                className={`group relative bg-white border p-6 sm:p-7 rounded-none flex flex-col justify-between transition-colors duration-150 ease-out hover:bg-semesta hover:border-semesta hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                  pkg.highlight
                    ? 'border-semesta ring-1 ring-semesta/25'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Baris Atas: Ikon Pilar & Badge Tier (Delay 120ms) */}
                  <div className="flex items-center justify-between gap-2 mb-2 group-hover:animate-cascade-icon group-hover:text-white">
                    <span className="w-10 h-10 border border-slate-200 text-semesta bg-white group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white flex items-center justify-center rounded-none">
                      {getPillarIcon(pkg.pillar)}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-none border ${
                        pkg.highlight
                          ? 'bg-semesta/10 text-semesta border-semesta/20 group-hover:bg-white/20 group-hover:border-white/30 group-hover:text-white'
                          : 'bg-slate-50 text-slate-500 border-slate-200 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white'
                      }`}
                    >
                      {pkg.tier} {pkg.highlight ? '★ FAVORIT' : ''}
                    </span>
                  </div>

                  {/* Identitas Paket (Delay 170ms) */}
                  <div className="group-hover:animate-cascade-title">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-white mt-4 leading-snug">
                      {pkg.nama_paket}
                    </h3>
                    <p className="font-mono text-semesta group-hover:text-white/80 text-xs font-semibold mb-3">
                      {pkg.pillar} • [{pkg.tagline}]
                    </p>
                  </div>

                  {/* Rentang Harga Utama (Delay 220ms) */}
                  <div className="text-2xl font-extrabold text-slate-900 group-hover:text-white tracking-tight mb-4 group-hover:animate-cascade-price">
                    {pkg.range_harga}
                  </div>

                  {/* Garis Pembatas Halus */}
                  <div className="border-t border-slate-200 group-hover:border-white/20 my-4"></div>

                  {/* Checklist Poin Terstruktur (Delay bertahap 260ms, 300ms, 340ms, 380ms, 420ms) */}
                  <div className="space-y-2.5 my-4">
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 group-hover:text-white group-hover:animate-cascade-check-1">
                      <span className="w-5 h-5 bg-semesta/10 text-semesta group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 rounded-none">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-tight">
                        <strong className="font-semibold text-slate-900 group-hover:text-white">Waktu:</strong> {pkg.durasi}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 group-hover:text-white group-hover:animate-cascade-check-2">
                      <span className="w-5 h-5 bg-semesta/10 text-semesta group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 rounded-none">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-tight">
                        <strong className="font-semibold text-slate-900 group-hover:text-white">Revisi:</strong> {pkg.revisi}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 group-hover:text-white group-hover:animate-cascade-check-3">
                      <span className="w-5 h-5 bg-semesta/10 text-semesta group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 rounded-none">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-tight">
                        <strong className="font-semibold text-slate-900 group-hover:text-white">Brief:</strong> {pkg.syarat_brief}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 group-hover:text-white group-hover:animate-cascade-check-4">
                      <span className="w-5 h-5 bg-semesta/10 text-semesta group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 rounded-none">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-tight">
                        <strong className="font-semibold text-slate-900 group-hover:text-white">Teknis:</strong> {pkg.cakupan_teknis}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 group-hover:text-white group-hover:animate-cascade-check-5">
                      <span className="w-5 h-5 bg-semesta/10 text-semesta group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 rounded-none">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-tight">
                        <strong className="font-semibold text-slate-900 group-hover:text-white">Output:</strong> {pkg.file_akhir}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Bawah (Delay 200ms) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePilihPaket(pkg.nama_paket, pkg.range_harga);
                  }}
                  className={`w-full py-3 px-4 text-xs font-bold text-center border rounded-none shadow-xs mt-6 transition-all duration-150 group-hover:delay-[200ms] group-hover:bg-white group-hover:text-semesta group-hover:border-white ${
                    pkg.highlight
                      ? 'bg-semesta text-white border-semesta hover:opacity-90'
                      : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Pilih Paket Ini →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAMPILAN 2: GRID KARTU TARIF SATUAN (A LA CARTE) */}
        {viewMode === 'reguler' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredReguler.map((item) => (
              <div
                key={item.id}
                onClick={() => handlePilihPaket(item.nama_layanan, item.range_harga)}
                className="group relative bg-white border border-slate-200 p-6 sm:p-7 rounded-none flex flex-col justify-between transition-colors duration-150 ease-out hover:bg-semesta hover:border-semesta hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  {/* Baris Atas: Ikon Pilar & Subkategori (Delay 120ms) */}
                  <div className="flex items-center justify-between gap-2 mb-2 group-hover:animate-cascade-icon group-hover:text-white">
                    <span className="w-10 h-10 border border-slate-200 text-semesta bg-white group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white flex items-center justify-center rounded-none">
                      {getPillarIcon(item.pillar)}
                    </span>
                    <span className="bg-slate-50 text-slate-500 border border-slate-200 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-none">
                      {item.sub_kategori}
                    </span>
                  </div>

                  {/* Nama Layanan (Delay 170ms) */}
                  <div className="group-hover:animate-cascade-title">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-white mt-4 leading-snug">
                      {item.nama_layanan}
                    </h3>
                    <p className="font-mono text-semesta group-hover:text-white/80 text-xs font-semibold mb-3">
                      {item.pillar}
                    </p>
                  </div>

                  {/* Rentang Harga (Delay 220ms) */}
                  <div className="text-2xl font-extrabold text-slate-900 group-hover:text-white tracking-tight mb-4 group-hover:animate-cascade-price">
                    {item.range_harga}
                  </div>

                  {/* Garis Pembatas Halus */}
                  <div className="border-t border-slate-200 group-hover:border-white/20 my-4"></div>

                  {/* Checklist Spesifikasi (Delay bertahap 260ms, 300ms, 340ms) */}
                  <div className="space-y-2.5 my-4">
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 group-hover:text-white group-hover:animate-cascade-check-1">
                      <span className="w-5 h-5 bg-semesta/10 text-semesta group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 rounded-none">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-tight">
                        <strong className="font-semibold text-slate-900 group-hover:text-white">Fokus:</strong> {item.fokus}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 group-hover:text-white group-hover:animate-cascade-check-2">
                      <span className="w-5 h-5 bg-semesta/10 text-semesta group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 rounded-none">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-tight">
                        <strong className="font-semibold text-slate-900 group-hover:text-white">Output:</strong> {item.output}
                      </span>
                    </div>

                    {item.durasi_opsional && (
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 group-hover:text-white group-hover:animate-cascade-check-3">
                        <span className="w-5 h-5 bg-semesta/10 text-semesta group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 rounded-none">
                          <CheckIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="leading-tight">
                          <strong className="font-semibold text-slate-900 group-hover:text-white">Waktu:</strong> {item.durasi_opsional}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tombol Konsultasi (Delay 200ms) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePilihPaket(item.nama_layanan, item.range_harga);
                  }}
                  className="w-full py-3 px-4 text-xs font-bold text-center border border-slate-300 text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-none shadow-xs mt-6 transition-all duration-150 group-hover:delay-[200ms] group-hover:bg-white group-hover:text-semesta group-hover:border-white"
                >
                  Konsultasi Layanan Ini →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* BAGIAN KETENTUAN LAYANAN & FAQ RINGKAS */}
        <div className="mb-14">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-semesta bg-semesta/10 border border-semesta/20 px-2.5 py-1 mb-2 rounded-none">
              <ShieldIcon className="w-3.5 h-3.5" />
              <span>GARANSI & KETENTUAN</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Panduan Revisi & Kebijakan Transaksi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Transparansi penuh agar proses pengerjaan berjalan tepat waktu, terukur, dan nyaman bagi kedua pihak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Revisi Minor */}
            <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs">
              <div className="w-7 h-7 bg-semesta/10 border border-semesta/20 text-semesta flex items-center justify-center mb-3 font-mono text-xs font-bold rounded-none">
                01
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                Cakupan Revisi Minor
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {ketentuan_layanan.revisi_minor}
              </p>
            </div>

            {/* Card 2: Perubahan Total */}
            <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs">
              <div className="w-7 h-7 bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-3 font-mono text-xs font-bold rounded-none">
                02
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                Perubahan Konsep Total
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {ketentuan_layanan.perubahan_konsep_total}
              </p>
            </div>

            {/* Card 3: Penambahan Revisi */}
            <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs">
              <div className="w-7 h-7 bg-semesta/10 border border-semesta/20 text-semesta flex items-center justify-center mb-3 font-mono text-xs font-bold rounded-none">
                03
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                Tarif Tambahan Revisi
              </h4>
              <ul className="text-xs text-slate-600 space-y-1 font-mono">
                <li>• Desain: {ketentuan_layanan.tarif_tambahan_revisi.desain_grafis}</li>
                <li>• Video: {ketentuan_layanan.tarif_tambahan_revisi.video_motion}</li>
                <li>• Web: {ketentuan_layanan.tarif_tambahan_revisi.web_frontend}</li>
              </ul>
            </div>

            {/* Card 4: Kebijakan DP */}
            <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs">
              <div className="w-7 h-7 bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3 font-mono text-xs font-bold rounded-none">
                04
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                Uang Muka (DP 50%)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {ketentuan_layanan.ketentuan_dp}
              </p>
            </div>
          </div>
        </div>

        {/* WIDGET FORMULIR BRIEF KONSULTASI WHATSAPP */}
        <div id="brief-form" className="scroll-mt-10">
          <div className="bg-white border border-slate-200 p-6 sm:p-10 rounded-none shadow-sm max-w-3xl mx-auto">
            <div className="border-b border-slate-200 pb-5 mb-6">
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-semesta bg-semesta/10 border border-semesta/20 px-2.5 py-1 mb-2 rounded-none">
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>FORMULIR BRIEF WHATSAPP</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Konsultasikan Rencana Proyek Anda
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Pilih opsi di bawah untuk menyusun draf konsultasi otomatis yang ringkas dan profesional langsung ke WhatsApp.
              </p>
            </div>

            <form onSubmit={handleKirimWhatsApp} className="space-y-5">
              {/* 1. Kebutuhan Proyek */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  1. Kebutuhan Proyek <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kebutuhan}
                  onChange={(e) => setKebutuhan(e.target.value)}
                  placeholder="Contoh: Poster Publikasi Lomba, Video Reels Promosi, Landing Page Toko"
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-800 rounded-none focus:outline-none focus:border-semesta focus:bg-white transition"
                />
              </div>

              {/* Grid 2 Kolom untuk Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 2. Tujuan Proyek */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    2. Tujuan Proyek
                  </label>
                  <select
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-800 rounded-none focus:outline-none focus:border-semesta focus:bg-white transition"
                  >
                    <option value="Tugas Kuliah / Kampus">Tugas Kuliah / Kampus</option>
                    <option value="Promosi UMKM / Jualan">Promosi UMKM / Jualan</option>
                    <option value="Organisasi / Komunitas">Organisasi / Komunitas</option>
                    <option value="Personal Branding">Personal Branding</option>
                    <option value="Event / Kepanitiaan">Event / Kepanitiaan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* 3. Format Output */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    3. Format Output yang Diharapkan
                  </label>
                  <select
                    value={formatOutput}
                    onChange={(e) => setFormatOutput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-800 rounded-none focus:outline-none focus:border-semesta focus:bg-white transition"
                  >
                    <option value="File Siap Cetak JPG/PNG HD">File Siap Cetak JPG/PNG HD</option>
                    <option value="File Master Editable (PSD/AI/PPT)">File Master Editable (PSD/AI/PPT)</option>
                    <option value="Video MP4 Full HD 1080p">Video MP4 Full HD 1080p</option>
                    <option value="Video MP4 4K / MOV Alpha">Video MP4 4K / MOV Alpha</option>
                    <option value="Source Code Web (React/Vite/Tailwind)">Source Code Web (React/Vite/Tailwind)</option>
                    <option value="Deploy Siap Pakai (Vercel/Cloudflare)">Deploy Siap Pakai (Vercel/Cloudflare)</option>
                    <option value="Lainnya / Disesuaikan">Lainnya / Disesuaikan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 4. Pilihan Paket */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    4. Pilihan Paket
                  </label>
                  <select
                    value={pilihanPaket}
                    onChange={(e) => setPilihanPaket(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-800 rounded-none focus:outline-none focus:border-semesta focus:bg-white transition"
                  >
                    <optgroup label="-- 9 Skema Paket Bertingkat --">
                      {paket_bertingkat.map((pkg) => (
                        <option key={pkg.id} value={`${pkg.nama_paket} (${pkg.range_harga})`}>
                          {pkg.nama_paket} ({pkg.range_harga})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="-- Tarif Satuan (A La Carte) --">
                      {tarif_reguler.map((item) => (
                        <option key={item.id} value={`${item.nama_layanan} (${item.range_harga})`}>
                          {item.nama_layanan} ({item.range_harga})
                        </option>
                      ))}
                    </optgroup>
                    <option value="Custom / Sesuai Budget">Custom / Sesuai Budget</option>
                  </select>
                </div>

                {/* 5. Estimasi Deadline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    5. Estimasi Deadline
                  </label>
                  <select
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-800 rounded-none focus:outline-none focus:border-semesta focus:bg-white transition"
                  >
                    <option value="Kilat 1–2 Hari">Kilat 1–2 Hari</option>
                    <option value="Santai 3–5 Hari">Santai 3–5 Hari</option>
                    <option value="Fleksibel">Fleksibel</option>
                  </select>
                </div>
              </div>

              {/* 6. Catatan Tambahan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  6. Catatan Tambahan / Request Khusus
                </label>
                <textarea
                  rows={3}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Tolong nuansa warna ungu violet dan ada logo sponsor di bawah."
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-800 rounded-none focus:outline-none focus:border-semesta focus:bg-white transition resize-none"
                />
              </div>

              {/* Preview Format Pesan */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-none font-mono text-[11px] text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">
                  Preview Pesan Otomatis:
                </span>
                <p className="whitespace-pre-line leading-relaxed">
                  {`Halo Sumesta, saya ingin konsultasi pengerjaan proyek:
- Kebutuhan: ${kebutuhan.trim() || '[Kebutuhan Anda]'}
- Tujuan: ${tujuan}
- Format Output: ${formatOutput}
- Pilihan Paket: ${pilihanPaket}
- Deadline: ${deadline}
- Catatan Khusus: ${catatan.trim() || '-'}

Apakah jadwalnya tersedia untuk pengerjaan ini?`}
                </p>
              </div>

              {/* Tombol Kirim WhatsApp */}
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-none w-full flex items-center justify-center gap-2 transition shadow-xs text-xs sm:text-sm"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Kirim Brief via WhatsApp Sekarang</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
