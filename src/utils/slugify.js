/**
 * Mengubah string teks menjadi slug anchor yang bersih, konsisten, dan SEO-friendly.
 * Menghapus tanda baca, simbol, tanda kurung, titik dua, backtick, dan karakter non-alfanumerik.
 */
export function slugify(text) {
  if (!text) return '';
  return String(text)
    .replace(/[*_`]/g, '') // Hapus formatting markdown bold, italic, code
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Hapus semua karakter yang bukan huruf, angka, spasi, atau strip
    .replace(/[\s_]+/g, '-') // Ganti spasi atau underscore menjadi dash
    .replace(/-+/g, '-') // Satukan strip ganda
    .replace(/^-+|-+$/g, ''); // Hapus strip di awal atau akhir
}

/**
 * Mengekstrak teks murni secara rekursif dari children React (string, array, atau nested elements)
 */
export function getNodeText(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getNodeText).join('');
  }
  if (node && typeof node === 'object' && node.props && node.props.children) {
    return getNodeText(node.props.children);
  }
  return '';
}
