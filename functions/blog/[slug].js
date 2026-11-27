/**
 * Cloudflare Pages Function untuk injeksi metadata SEO & OpenGraph secara dinamis
 * pada rute artikel blog (/blog/:slug) menggunakan HTMLRewriter dan Firestore REST API.
 */

const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/dtjbo9dba/image/upload/v1791253452/Screenshot_2026-10-06_102344_sx1sey.png';
const DEFAULT_SITE_NAME = 'Sumestawsome';

export async function onRequest(context) {
  const { request, params, env } = context;
  const rawSlug = params?.slug;

  // Lewatkan aset statis jika rute mengandung ekstensi file
  if (rawSlug && rawSlug.includes('.')) {
    return env?.ASSETS ? env.ASSETS.fetch(request) : context.next();
  }

  // 1. Ambil template HTML dasar dari aset statis (root index.html)
  let assetResponse;
  try {
    const rootUrl = new URL('/', request.url);
    const rootRequest = new Request(rootUrl.toString(), {
      headers: request.headers,
      method: 'GET',
    });
    assetResponse = env?.ASSETS
      ? await env.ASSETS.fetch(rootRequest)
      : await fetch(rootUrl.toString());
  } catch (err) {
    console.error('Gagal mengambil template HTML dasar:', err);
    return context.next ? context.next() : new Response('Internal Server Error', { status: 500 });
  }

  if (!assetResponse || !assetResponse.ok) {
    return assetResponse || new Response('Template Not Found', { status: 404 });
  }

  const slug = typeof rawSlug === 'string' ? decodeURIComponent(rawSlug).trim() : '';
  if (!slug) {
    return assetResponse;
  }

  // 2. Query data artikel dari Firestore REST API
  const projectId = env?.VITE_FIREBASE_PROJECT_ID || env?.FIREBASE_PROJECT_ID || 'sumestawsome';
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  const structuredQuery = {
    from: [{ collectionId: 'posts' }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'slug' },
        op: 'EQUAL',
        value: { stringValue: slug },
      },
    },
    limit: 1,
  };

  let articleFields = null;

  try {
    const firestoreRes = await fetch(firestoreUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ structuredQuery }),
    });

    if (firestoreRes.ok) {
      const results = await firestoreRes.json();
      if (Array.isArray(results) && results.length > 0 && results[0]?.document?.fields) {
        articleFields = results[0].document.fields;
      }
    }
  } catch (err) {
    console.error('Gagal mengambil data dari Firestore runQuery:', err);
  }

  // Fallback query via direct document ID jika belum ditemukan
  if (!articleFields) {
    try {
      const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts/${encodeURIComponent(slug)}`;
      const docRes = await fetch(docUrl);
      if (docRes.ok) {
        const docData = await docRes.json();
        if (docData?.fields) {
          articleFields = docData.fields;
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data dari Firestore direct doc:', err);
    }
  }

  // 5. Graceful fallback jika artikel tidak ditemukan di database
  if (!articleFields) {
    return assetResponse;
  }

  // 3. Ekstrak nilai string metadata
  const rawTitle = articleFields.title?.stringValue?.trim() || '';
  const seoMetaTitle = articleFields.seo?.mapValue?.fields?.metaTitle?.stringValue?.trim() || '';
  const articleTitle = rawTitle || seoMetaTitle || 'Artikel Blog';
  const pageTitle = `${articleTitle} | ${DEFAULT_SITE_NAME}`;

  const rawExcerpt = articleFields.excerpt?.stringValue?.trim() || '';
  const seoMetaDesc = articleFields.seo?.mapValue?.fields?.metaDescription?.stringValue?.trim() || '';
  const description =
    seoMetaDesc || rawExcerpt || 'Baca artikel dan panduan komputasi di Sumestawsome.';

  let imageUrl =
    articleFields.coverImage?.mapValue?.fields?.url?.stringValue?.trim() ||
    articleFields.coverImage?.stringValue?.trim() ||
    articleFields.thumbnail?.stringValue?.trim() ||
    articleFields.image?.stringValue?.trim() ||
    '';

  if (imageUrl) {
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      imageUrl = `https://sumestawsome.xyz${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
  } else {
    imageUrl = DEFAULT_OG_IMAGE;
  }

  const canonicalUrl = `https://sumestawsome.xyz/blog/${slug}`;

  // 4. Injeksi metadata ke template HTML dengan HTMLRewriter
  if (typeof HTMLRewriter === 'undefined') {
    return assetResponse;
  }

  return new HTMLRewriter()
    .on('title', {
      element(el) {
        el.setInnerContent(pageTitle);
      },
    })
    .on('meta[name="description"]', {
      element(el) {
        el.setAttribute('content', description);
      },
    })
    .on('meta[property="og:description"]', {
      element(el) {
        el.setAttribute('content', description);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(el) {
        el.setAttribute('content', description);
      },
    })
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute('content', articleTitle);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(el) {
        el.setAttribute('content', articleTitle);
      },
    })
    .on('meta[property="og:image"]', {
      element(el) {
        el.setAttribute('content', imageUrl);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute('content', imageUrl);
      },
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute('content', canonicalUrl);
      },
    })
    .on('link[rel="canonical"]', {
      element(el) {
        el.setAttribute('href', canonicalUrl);
      },
    })
    .on('meta[property="og:type"]', {
      element(el) {
        el.setAttribute('content', 'article');
      },
    })
    .on('meta[name="twitter:card"]', {
      element(el) {
        el.setAttribute('content', 'summary_large_image');
      },
    })
    .transform(assetResponse);
}
