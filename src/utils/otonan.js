/**
 * Modul Perhitungan Kalender Tradisi Bali (Pawukon & Otonan) ke Kalender Masehi.
 * 
 * Dasar Matematika Pawukon:
 * - 1 Siklus Pawukon = 30 Wuku x 7 Hari (Saptawara) = 210 Hari.
 * - 1 Siklus Pancawara = 5 Hari Pasaran (Umanis, Pahing, Pon, Wage, Kliwon).
 * - Karena 210 habis dibagi 5 (210 = 42 x 5) dan 7 (210 = 30 x 7), maka setiap kombinasi
 *   (Wuku, Saptawara) SELALU memiliki pasaran Pancawara yang sama dan tetap di setiap siklus.
 */

export const PANCAWARA = ['Umanis', 'Pahing', 'Pon', 'Wage', 'Kliwon'];

export const SAPTAWARA = [
  'Redite',
  'Soma',
  'Anggara',
  'Budha',
  'Wraspati',
  'Sukra',
  'Saniscara',
];

export const SAPTAWARA_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const WUKU = [
  'Sinta',
  'Landep',
  'Ukir',
  'Kulantir',
  'Tolu',
  'Gumbreg',
  'Wariga',
  'Warigadean',
  'Julungwangi',
  'Sungsang',
  'Dungulan',
  'Kuningan',
  'Langkir',
  'Medangsia',
  'Pujut',
  'Pahang',
  'Krulut',
  'Mrakih',
  'Tambir',
  'Madangkungan',
  'Matal',
  'Uye',
  'Manail',
  'Perangbakat',
  'Bala',
  'Ugu',
  'Wayang',
  'Klawu',
  'Dukut',
  'Watugunung',
];

// Titik Acuan Tetap:
// 12 Maret 2025: Budha (Saptawara index 3), Pon (Pancawara index 2), Wuku index 4 (Tolu).
const REF_WUKU_INDEX = 4;
const REF_SAPTAWARA_INDEX = 3;
const REF_PANCAWARA_INDEX = 2;
const REF_PAWUKON_DAY = REF_WUKU_INDEX * 7 + REF_SAPTAWARA_INDEX; // 31

/**
 * Menghitung indeks Pancawara yang seharusnya untuk kombinasi Wuku & Saptawara yang dipilih.
 * @param {number} wukuIndex - Indeks Wuku (0 s.d. 29)
 * @param {number} saptawaraIndex - Indeks Saptawara (0 s.d. 6)
 * @returns {number} Indeks Pancawara (0 s.d. 4)
 */
export function getExpectedPancawaraIndex(wukuIndex, saptawaraIndex) {
  const targetDay = wukuIndex * 7 + saptawaraIndex;
  const pIndex = ((REF_PANCAWARA_INDEX + (targetDay - REF_PAWUKON_DAY)) % 5 + 5) % 5;
  return pIndex;
}

/**
 * Memvalidasi apakah pilihan Pancawara sesuai dengan Wuku & Saptawara.
 */
export function isPancawaraValid(wukuIndex, saptawaraIndex, pancawaraIndex) {
  return getExpectedPancawaraIndex(wukuIndex, saptawaraIndex) === pancawaraIndex;
}

/**
 * Mencari semua tanggal Masehi dalam rentang tahun [startYear, endYear].
 * @param {number} wukuIndex - Indeks Wuku (0 s.d. 29)
 * @param {number} saptawaraIndex - Indeks Saptawara (0 s.d. 6)
 * @param {number} startYear - Tahun awal (misal: 1955)
 * @param {number} endYear - Tahun akhir (misal: 1970)
 * @returns {Date[]} Daftar objek Date Masehi yang cocok
 */
export function calculateOtonanDates(wukuIndex, saptawaraIndex, startYear, endYear) {
  const minYear = Math.min(startYear, endYear);
  const maxYear = Math.max(startYear, endYear);

  const targetDay = wukuIndex * 7 + saptawaraIndex;
  const offsetDays = targetDay - REF_PAWUKON_DAY;

  // Tanggal patokan dasar pada tahun 2025 (pukul 12:00:00 UTC untuk keamanan daylight saving)
  const d = new Date(Date.UTC(2025, 2, 12 + offsetDays, 12, 0, 0));

  // Mundurkan tanggal kelipatan 210 hari hingga melewati batas bawah tahun pencarian
  while (d.getUTCFullYear() >= minYear) {
    d.setUTCDate(d.getUTCDate() - 210);
  }

  // Majukan tanggal kelipatan 210 hari dan kumpulkan tanggal yang berada di rentang tahun
  const results = [];
  while (d.getUTCFullYear() <= maxYear) {
    if (d.getUTCFullYear() >= minYear) {
      results.push(new Date(d));
    }
    d.setUTCDate(d.getUTCDate() + 210);
  }

  return results;
}

/**
 * Format tanggal Masehi ke bahasa Indonesia lengkap.
 * Contoh: "Rabu, 23 Maret 1960"
 */
export function formatIndonesianDate(dateObj) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateObj);
}
