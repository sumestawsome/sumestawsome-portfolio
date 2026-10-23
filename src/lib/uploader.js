/**
 * Helper Unggah Gambar Blog Dua Tahap:
 * 1. Upload ke Cloudinary REST API (Unsigned Preset) & transformasi WebP.
 * 2. Mengirim URL ke Rumahweb PHP CDN endpoint untuk caching/hosting final.
 */

export async function uploadBlogImage(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const rumahwebCdnUrl = import.meta.env.VITE_RUMAHWEB_CDN_URL;
  const uploadSecretToken = import.meta.env.VITE_UPLOAD_SECRET_TOKEN;

  if (!cloudName || !uploadPreset) {
    throw new Error('Konfigurasi Cloudinary belum lengkap di file environment.');
  }

  // --- Tahap 1: Upload ke Cloudinary ---
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const cloudinaryEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const cloudinaryRes = await fetch(cloudinaryEndpoint, {
    method: 'POST',
    body: formData,
  });

  if (!cloudinaryRes.ok) {
    const errorData = await cloudinaryRes.json().catch(() => ({}));
    throw new Error(
      `Gagal mengunggah ke Cloudinary: ${errorData.error?.message || cloudinaryRes.statusText}`
    );
  }

  const cloudinaryData = await cloudinaryRes.json();
  let cloudinaryUrl = cloudinaryData.secure_url || cloudinaryData.url;

  if (!cloudinaryUrl) {
    throw new Error('Tidak menerima URL gambar dari Cloudinary.');
  }

  // Optimasi WebP otomatis via transformasi Cloudinary jika format asal bukan webp
  if (cloudinaryUrl.includes('/upload/') && !cloudinaryUrl.endsWith('.webp')) {
    cloudinaryUrl = cloudinaryUrl.replace('/upload/', '/upload/f_webp,q_auto/');
  }

  // Jika Rumahweb CDN URL tidak diset, kembalikan URL Cloudinary sebagai fallback
  if (!rumahwebCdnUrl) {
    console.warn('[Uploader] VITE_RUMAHWEB_CDN_URL tidak diatur. Menggunakan URL Cloudinary langsung.');
    return cloudinaryUrl;
  }

  // --- Tahap 2: Sinkronisasi ke Rumahweb CDN ---
  const cdnEndpoint = `${rumahwebCdnUrl.replace(/\/+$/, '')}/upload.php`;
  const cdnRes = await fetch(cdnEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(uploadSecretToken ? { Authorization: `Bearer ${uploadSecretToken}` } : {}),
    },
    body: JSON.stringify({ image_url: cloudinaryUrl }),
  });

  if (!cdnRes.ok) {
    const cdnErrorText = await cdnRes.text().catch(() => '');
    throw new Error(`Gagal menyimpan ke CDN Rumahweb (${cdnRes.status}): ${cdnErrorText}`);
  }

  const cdnData = await cdnRes.json().catch(() => null);
  const finalUrl = cdnData?.url || cdnData?.image_url || cdnData?.file_url || cdnData?.data?.url;

  if (!finalUrl) {
    // Jika respons sukses tanpa struktur URL spesifik, cek jika respons berupa string URL langsung
    if (typeof cdnData === 'string' && cdnData.startsWith('http')) {
      return cdnData;
    }
    // Jika endpoint Rumahweb mengembalikan status OK namun format belum ditentukan, fallback ke cloudinaryUrl
    return cloudinaryUrl;
  }

  return finalUrl;
}
