import { useState, useEffect, useMemo } from 'react';
import {
  PANCAWARA,
  SAPTAWARA,
  SAPTAWARA_ID,
  WUKU,
  getExpectedPancawaraIndex,
  isPancawaraValid,
  calculateOtonanDates,
  formatIndonesianDate,
} from '../../utils/otonan';
import { updateMetaTags } from '../../utils/seo';
import {
  Calendar,
  Search,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Info,
  Clock,
  Compass,
  Share2,
} from 'lucide-react';

export default function OtonanTool({ onNavigate = () => {} }) {
  // SEO Meta Tags
  useEffect(() => {
    updateMetaTags({
      title: 'OtonanE - Cari Tahu Tanggal Lahir dari Hari Otonan Bali | Web Tool',
      description:
        'Konversi hari otonan Bali (Pancawara, Saptawara, Wuku) menjadi perkiraan tanggal lahir kalender Masehi secara akurat dan instan.',
      canonical: 'https://sumestawsome.xyz/tools/cari-tanggal-lahir-otonan',
    });
  }, []);

  // Form State
  // Default acuan 12 Maret 2025: Budha (3), Pon (2), Tolu (4)
  const [selectedSaptawara, setSelectedSaptawara] = useState(3); // Budha
  const [selectedWuku, setSelectedWuku] = useState(4); // Tolu
  const [selectedPancawara, setSelectedPancawara] = useState(2); // Pon
  const [startYear, setStartYear] = useState(1955);
  const [endYear, setEndYear] = useState(1975);

  // Status & Feedback
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingleIndex, setCopiedSingleIndex] = useState(null);

  // Pancawara yang secara matematis sesuai dengan Saptawara & Wuku yang dipilih
  const expectedPancawara = useMemo(() => {
    return getExpectedPancawaraIndex(selectedWuku, selectedSaptawara);
  }, [selectedWuku, selectedSaptawara]);

  // Cek apakah pilihan Pancawara cocok
  const isPancawaraMatched = selectedPancawara === expectedPancawara;

  // Auto-sync Pancawara saat Saptawara atau Wuku berubah
  const handleSaptawaraChange = (newVal) => {
    const sIndex = Number(newVal);
    setSelectedSaptawara(sIndex);
    const expP = getExpectedPancawaraIndex(selectedWuku, sIndex);
    setSelectedPancawara(expP);
  };

  const handleWukuChange = (newVal) => {
    const wIndex = Number(newVal);
    setSelectedWuku(wIndex);
    const expP = getExpectedPancawaraIndex(wIndex, selectedSaptawara);
    setSelectedPancawara(expP);
  };

  const handlePancawaraChange = (newVal) => {
    setSelectedPancawara(Number(newVal));
  };

  const handleFixPancawara = () => {
    setSelectedPancawara(expectedPancawara);
  };

  // Submit Handler
  const handleSearch = (e) => {
    if (e) e.preventDefault();

    if (!isPancawaraMatched) {
      setResults([]);
      setHasSearched(true);
      return;
    }

    const foundDates = calculateOtonanDates(
      selectedWuku,
      selectedSaptawara,
      Number(startYear) || 1950,
      Number(endYear) || 1980
    );

    setResults(foundDates);
    setHasSearched(true);
  };

  // Jalankan pencarian awal secara otomatis saat halaman dibuka pertama kali
  useEffect(() => {
    handleSearch();
  }, []);

  // Salin Semua Tanggal
  const handleCopyAll = async () => {
    if (results.length === 0) return;

    const otonanTitle = `${SAPTAWARA[selectedSaptawara]} ${PANCAWARA[selectedPancawara]} ${WUKU[selectedWuku]}`;
    const lines = [
      `Daftar Tanggal Lahir Otonan: ${otonanTitle} (Rentang ${startYear} - ${endYear})`,
      `Sumber: OtonanE (https://sumestawsome.xyz/tools/cari-tanggal-lahir-otonan)`,
      '--------------------------------------------------',
      ...results.map((dt, idx) => `${idx + 1}. ${formatIndonesianDate(dt)}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.error('Gagal menyalin:', err);
    }
  };

  // Salin Tanggal Tunggal
  const handleCopySingle = async (dateObj, idx) => {
    const text = formatIndonesianDate(dateObj);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSingleIndex(idx);
      setTimeout(() => setCopiedSingleIndex(null), 2000);
    } catch (err) {
      console.error('Gagal menyalin:', err);
    }
  };

  // Hitung perkiraan umur relatif
  const currentYear = new Date().getFullYear();
  const getApproxAge = (dateObj) => {
    const y = dateObj.getUTCFullYear();
    const age = currentYear - y;
    if (age === 0) return 'Tahun ini';
    if (age > 0) return `Sekitar ${age} tahun yang lalu`;
    return `${Math.abs(age)} tahun mendatang`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* 1. Navbar Khusus OtonanE */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Sub-badge */}
          <div className="flex items-center gap-3">
            <a
              href="/tools/cari-tanggal-lahir-otonan"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('tool-otonan');
              }}
              className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center"
            >
              <span>Otonan</span>
              <span className="text-blue-600">E</span>
            </a>
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-none">
              <Compass className="w-3 h-3 text-blue-600" />
              <span>Web Tool Tradisi & Algoritma</span>
            </span>
          </div>

          {/* Navigasi Balik ke Portofolio */}
          <div className="flex items-center gap-2">
            <a
              href="https://sumestawsome.xyz/"
              onClick={(e) => {
                // Jika routing internal didukung, arahkan ke home
                if (typeof onNavigate === 'function') {
                  e.preventDefault();
                  onNavigate('home');
                }
              }}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 px-3 py-1.5 transition-colors rounded-none shadow-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Portofolio</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Hero Section Ringkas */}
          <section className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-none shadow-none">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Siklus 210 Hari Pawukon Bali</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Cari Tahu Tanggal Lahir dari Hari Otonan
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Ketahui perkiraan tanggal dan tahun kelahiran kalender Masehi Anda atau orang tua berdasarkan kombinasi Saptawara, Pancawara, dan Wuku secara instan.
            </p>
          </section>

          {/* Form Panel Interaktif */}
          <section className="bg-white border-2 border-slate-900 p-6 sm:p-8 rounded-none shadow-none">
            <div className="border-b border-slate-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Pilih Hari Otonan & Rentang Tahun</span>
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Tentukan kombinasi hari lahir tradisi Bali dan perkiraan dekade kelahiran.
                </p>
              </div>
              <div className="font-mono text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 self-start sm:self-auto rounded-none">
                Target: {SAPTAWARA[selectedSaptawara]} {PANCAWARA[selectedPancawara]} {WUKU[selectedWuku]}
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              {/* 3 Dropdown Hari Otonan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Saptawara */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    1. Saptawara (7 Hari)
                  </label>
                  <select
                    value={selectedSaptawara}
                    onChange={(e) => handleSaptawaraChange(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-900 focus:border-blue-600 focus:bg-white text-slate-900 font-medium px-3.5 py-2.5 text-sm rounded-none outline-none transition-colors"
                  >
                    {SAPTAWARA.map((nama, idx) => (
                      <option key={nama} value={idx}>
                        {nama} ({SAPTAWARA_ID[idx]})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                    Nama hari dalam sepekan.
                  </span>
                </div>

                {/* 2. Pancawara */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    2. Pancawara (5 Pasaran)
                  </label>
                  <select
                    value={selectedPancawara}
                    onChange={(e) => handlePancawaraChange(e.target.value)}
                    className={`w-full bg-slate-50 border-2 ${
                      isPancawaraMatched ? 'border-slate-900' : 'border-amber-600 bg-amber-50'
                    } focus:border-blue-600 focus:bg-white text-slate-900 font-medium px-3.5 py-2.5 text-sm rounded-none outline-none transition-colors`}
                  >
                    {PANCAWARA.map((nama, idx) => (
                      <option key={nama} value={idx}>
                        {nama} {idx === expectedPancawara ? '(Sesuai Wuku)' : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                    Pasaran: Umanis, Pahing, Pon, Wage, Kliwon.
                  </span>
                </div>

                {/* 3. Wuku */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    3. Wuku (30 Siklus)
                  </label>
                  <select
                    value={selectedWuku}
                    onChange={(e) => handleWukuChange(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-900 focus:border-blue-600 focus:bg-white text-slate-900 font-medium px-3.5 py-2.5 text-sm rounded-none outline-none transition-colors"
                  >
                    {WUKU.map((nama, idx) => (
                      <option key={nama} value={idx}>
                        {idx + 1}. {nama}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                    Siklus wuku dari Sinta hingga Watugunung.
                  </span>
                </div>
              </div>

              {/* Peringatan jika Pancawara tidak sesuai */}
              {!isPancawaraMatched && (
                <div className="bg-amber-50 border-2 border-amber-500 p-4 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        Perhatian: Pasaran Pancawara tidak cocok dengan siklus Pawukon!
                      </p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Dalam kalender Bali, hari <strong>{SAPTAWARA[selectedSaptawara]}</strong> pada wuku <strong>{WUKU[selectedWuku]}</strong> selalu jatuh pada pasaran <strong>{PANCAWARA[expectedPancawara]}</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFixPancawara}
                    className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-xs px-3.5 py-2 rounded-none transition-colors cursor-pointer"
                  >
                    Sesuaikan ke {PANCAWARA[expectedPancawara]}
                  </button>
                </div>
              )}

              {/* 2 Input Rentang Tahun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tahun Mulai Pencarian
                  </label>
                  <input
                    type="number"
                    min="1850"
                    max="2100"
                    required
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    placeholder="Misal: 1955"
                    className="w-full bg-slate-50 border-2 border-slate-900 focus:border-blue-600 focus:bg-white text-slate-900 font-mono text-sm px-3.5 py-2.5 rounded-none outline-none transition-colors"
                  />
                  <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                    Batas bawah tahun kelahiran yang dicari.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tahun Akhir Pencarian
                  </label>
                  <input
                    type="number"
                    min="1850"
                    max="2100"
                    required
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    placeholder="Misal: 1975"
                    className="w-full bg-slate-50 border-2 border-slate-900 focus:border-blue-600 focus:bg-white text-slate-900 font-mono text-sm px-3.5 py-2.5 rounded-none outline-none transition-colors"
                  />
                  <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                    Batas atas tahun kelahiran yang dicari.
                  </span>
                </div>
              </div>

              {/* Tombol Aksi Utama */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-mono font-bold text-base py-3.5 px-6 rounded-none shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer border-2 border-slate-900"
              >
                <Search className="w-5 h-5" />
                <span>Cari Tanggal Lahir</span>
              </button>
            </form>
          </section>

          {/* Hasil Pencarian */}
          {hasSearched && (
            <section className="space-y-6">
              {/* Header Hasil */}
              <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      Hasil Pencarian: {results.length} Tanggal Ditemukan
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 font-mono mt-1">
                    Kombinasi <strong>{SAPTAWARA[selectedSaptawara]} {PANCAWARA[selectedPancawara]} {WUKU[selectedWuku]}</strong> dalam rentang tahun <strong>{startYear} – {endYear}</strong>.
                  </p>
                </div>

                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-none transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-none"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Semua Tanggal Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Semua Tanggal</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Grid Kartu Tanggal */}
              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((dateObj, idx) => {
                    const formatted = formatIndonesianDate(dateObj);
                    const year = dateObj.getUTCFullYear();
                    const isoDate = dateObj.toISOString().slice(0, 10);
                    const approxAge = getApproxAge(dateObj);
                    const isCopied = copiedSingleIndex === idx;

                    return (
                      <div
                        key={idx}
                        className="bg-blue-600 text-white border-2 border-slate-900 rounded-none shadow-none p-5 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Nomor Urut & Tahun Badge */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-blue-700 text-blue-100 border border-blue-400 font-mono text-xs px-2 py-0.5 rounded-none">
                              #{idx + 1} • {year}
                            </span>
                            <span className="text-blue-200 font-mono text-xs">
                              {isoDate}
                            </span>
                          </div>

                          {/* Nama Hari & Tanggal Lengkap */}
                          <h4 className="text-white font-bold text-lg mt-1 leading-snug">
                            {formatted}
                          </h4>

                          {/* Estimasi Usia */}
                          <p className="text-blue-100 text-sm font-mono flex items-center gap-1.5 mt-2">
                            <Clock className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                            <span>{approxAge}</span>
                          </p>
                        </div>

                        {/* Tombol Salin Tanggal */}
                        <button
                          type="button"
                          onClick={() => handleCopySingle(dateObj, idx)}
                          className="bg-white text-blue-900 font-medium hover:bg-blue-50 border border-slate-900 rounded-none py-1.5 px-3 text-xs inline-flex items-center gap-1.5 transition-colors self-end mt-4 cursor-pointer shadow-none"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-semibold text-emerald-700">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-blue-900" />
                              <span>Salin Tanggal</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border-2 border-slate-900 p-8 sm:p-12 text-center rounded-none shadow-none">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    Tidak Ditemukan Tanggal yang Cocok
                  </h4>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Pastikan kombinasi Pancawara, Saptawara, dan Wuku sudah sesuai dengan aturan siklus 210 hari Pawukon, serta rentang tahun pencarian sudah mencukupi.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* 3. Banner Tautan ke Artikel Blog */}
          <section className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-2 border-slate-900 p-6 sm:p-8 rounded-none shadow-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  Eksplorasi Algoritma & Budaya
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Penasaran bagaimana logika siklus 210 hari ini dihitung dengan kode pemrograman?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pelajari rahasia matematika di balik penanggalan Pawukon Bali dan bagaimana algoritma offset tanggal diterapkan dalam JavaScript.
                </p>
              </div>

              <a
                href="/blog"
                onClick={(e) => {
                  if (typeof onNavigate === 'function') {
                    e.preventDefault();
                    onNavigate('blog');
                  }
                }}
                className="shrink-0 inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-mono font-bold text-xs sm:text-sm px-5 py-3 transition-colors rounded-none shadow-none"
              >
                <span>Baca di Blog Sumestawsome</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </section>

          {/* Kotak Edukasi Ringkas tentang Pawukon Bali */}
          <section className="bg-white border border-slate-200 p-6 rounded-none space-y-3 font-mono text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm font-sans">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Sekilas tentang Siklus Otonan Bali</span>
            </h4>
            <p className="leading-relaxed font-sans text-xs sm:text-sm">
              Otonan diperingati setiap <strong>210 hari sekali</strong> (bukan setiap tahun Masehi seperti ulang tahun pada umumnya). Siklus ini merupakan hasil perputaran serempak antara <strong>Saptawara</strong> (siklus 7 hari), <strong>Pancawara</strong> (siklus 5 hari pasaran), dan <strong>Wuku</strong> (siklus 30 wuku).
            </p>
          </section>

        </div>
      </main>

      {/* 4. Footer Khusus OtonanE */}
      <footer className="bg-white border-t-2 border-slate-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-slate-900 text-base">OtonanE</span>
              <span className="text-xs text-slate-500 font-mono">• Konverter Hari Otonan ke Tanggal Masehi</span>
            </div>
            <p className="text-xs text-slate-500">
              Dikembangkan secara independen oleh <strong>Putu Agus Sumerta</strong> • Bagian dari ekosistem{' '}
              <a
                href="https://sumestawsome.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-semibold"
              >
                sumestawsome.xyz
              </a>
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <a
              href="https://sumestawsome.xyz/"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Beranda
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="https://sumestawsome.xyz/karya"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Galeri Karya
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="https://sumestawsome.xyz/blog"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Blog
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
