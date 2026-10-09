# PROJECT ANALYSIS: TOKOSAYA E-COMMERCE

> **Audit Arsitektur Mendalam & Ekstraksi Kode Lengkap**  
> **Tech Stack**: React 19 + Vite 8 + Tailwind CSS v4 + React Router DOM v7  
> **Gaya Desain**: *Neo-Minimalist Sharp Edges* (Zero Rounded / Sudut Tegas) & *Canva Sans Typography*  
> **Target Analisis**: Komprehensif untuk level fundamental hingga *intermediate* React.

---

## 1. Peta Pohon Direktori (File Tree)

Struktur hierarkis direktori `src/` menyajikan pemisahan peran yang modular (*Separation of Concerns*) antara tata letak (*layouts*), halaman etalase & admin (*pages*), komponen UI *reusable* (*components*), manajemen status global (*utils/context*), data mentah (*data*), serta konfigurasi aset:

```text
src/
├── App.css                                # Style spesifik lokal (opsional)
├── App.jsx                                # Deklarasi rute utama aplikasi (Routing Hub)
├── index.css                              # Konfigurasi Tailwind CSS v4 (@theme & font-face)
├── main.jsx                               # Entry point React DOM, BrowserRouter, & Context Providers
│
├── assets/                                # Aset font dan grafis internal
│   ├── fonts/
│   │   ├── CanvaSans-Bold.otf
│   │   ├── CanvaSans-Medium.otf
│   │   └── CanvaSans-Regular.otf
│   ├── hero.png                           # Banner grafis hero etalase
│   ├── react.svg
│   └── vite.svg
│
├── components/                            # Komponen antarmuka modular reusable
│   ├── Navbar.jsx                         # Navigasi atas toko publik + cart counter & alert badge
│   ├── ProductCard.jsx                    # Kartu display produk individu + trigger tambah keranjang
│   ├── ProductFilterBar.jsx               # Bar pencarian teks utuh, filter kategori, & sorting harga
│   └── Sidebar.jsx                        # Navigasi vertikal admin panel + drawer responsif mobile
│
├── data/                                  # Penyimpanan sumber data statis
│   └── products.json                      # Basis data lokal katalog produk (16 item multispesifikasi)
│
├── layouts/                               # Kerangka tata letak bertingkat (Nested Route Shells)
│   ├── AdminLayout.jsx                    # Shell halaman admin (Sidebar + Route Guard + Outlet)
│   └── MainLayout.jsx                     # Shell halaman publik (Navbar + Container 1400px + Outlet + Footer)
│
├── pages/                                 # Halaman-halaman tampilan aplikasi
│   ├── LoginPage.jsx                      # Autentikasi administrator (Email & Password Form)
│   ├── LogoutPage.jsx                     # Konfirmasi dialog keluar akun administrator
│   │
│   ├── adminpages/                        # Modul halaman khusus Administrator
│   │   ├── AboutPage.jsx                  # Informasi arsitektur & identitas modul aplikasi
│   │   └── AdminDashboard.jsx             # Metrik transaksi, ringkasan inventaris, & status server
│   │
│   └── frontpages/                        # Modul halaman Etalase Publik Pelanggan
│       ├── Cart.jsx                       # Keranjang belanja, mutasi kuantitas, & modal hapus
│       ├── Checkout.jsx                   # Formulir alamat pengiriman, ekspedisi, pembayaran, & invoice
│       ├── Dashboard.jsx                  # Katalog etalase utama (Search, Filter, Sort, & Grid)
│       └── ProductDetail.jsx              # Rincian detail produk terpilih & sistem ulasan interaktif
│
└── utils/                                 # Pengelolaan state global (Context API)
    ├── AuthContext.jsx                    # Status sesi administrator, kredensial login, & LocalStorage
    └── CartContext.jsx                    # Keranjang belanja global, kalkulasi kuantitas/harga, & sinkronisasi browser
```

---

## 2. Ringkasan Arsitektur & Pola Navigasi (Routing & Layouts)

### 2.1 Konfigurasi Entry Point & Penyedia Konteks (`main.jsx`)
Sebelum rute dieksekusi di `App.jsx`, aplikasi dibungkus oleh tiga *wrapper provider* hierarkis di `main.jsx`:
1. `<BrowserRouter>` dari `react-router-dom`: Mengaktifkan fungsionalitas HTML5 History API untuk navigasi tanpa *full-page reload* (SPA).
2. `<AuthProvider>`: Menyediakan status otentikasi admin di seluruh pohon komponen.
3. `<CartProvider>`: Menyediakan *state* keranjang belanja yang dapat diakses oleh *Navbar*, kartu produk, maupun halaman *Checkout*.

```jsx
// src/main.jsx
<StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
</StrictMode>
```

### 2.2 Struktur Deklarasi Rute (`src/App.jsx`)
File `App.jsx` bertindak sebagai *Routing Hub* yang menyusun rute menggunakan komponen `<Routes>` dan `<Route>` dari `react-router-dom` v7. Alur rute dibagi menjadi 3 kategori:
1. **Rute Mandiri (Auth)**: `/login` dan `/logout` dirender tanpa *layout* luar agar fokus pada dialog aksi.
2. **Rute Etalase Publik (`/`)**: Dibungkus oleh `<MainLayout />`.
3. **Rute Dashboard Admin (`/admin`)**: Dibungkus oleh `<AdminLayout />`.

```jsx
// src/App.jsx
export default function App() {
  return (
    <Routes>
      {/* 1. Rute Autentikasi Pengguna */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      {/* 2. Rute Etalase Publik (Frontpage) via Nested Route */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
      </Route>

      {/* 3. Rute Modul Admin (Backpage) via Nested Route */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
}
```

### 2.3 Konsep Nested Routes & Peran Komponen `<Outlet />`
*Nested Routes* (Rute Bersarang) memungkinkan komponen induk (*Layout*) tetap menetap di layar (persisten), sementara area konten dinamis di dalamnya berganti secara mulus sesuai URL.

* **Fungsi `<Outlet />`**: Bertindak sebagai *placeholder* (slot injeksi dinamis). Ketika rute `/cart` dikunjungi, `MainLayout` tetap merender `Navbar` dan `Footer`, sementara `<Outlet />` diisi oleh komponen `Cart`.
* **Pemisahan `MainLayout` vs `AdminLayout`**:
  * `MainLayout`: Menyediakan navigasi horizontal atas (`Navbar`), *container* selebar 1400px, dan *footer* umum toko.
  * `AdminLayout`: Menyediakan navigasi vertikal samping (`Sidebar`), bilah menu *mobile*, penahan rute terproteksi (*Route Guard*), dan tata letak khas dasbor administrasi.

```
       [ BrowserRouter ]
               │
     ┌─────────┴─────────┐
     │                   │
[ MainLayout ]     [ AdminLayout ] ──> Proteksi Sesi: if (!user) <Navigate to="/login" />
  ├── Navbar         ├── Sidebar
  ├── <Outlet />     ├── <Outlet />
  │    ├── /               ├── /admin
  │    ├── /product/:slug  ├── /admin/dashboard
  │    ├── /cart           └── /admin/about
  │    └── /checkout
  └── Footer
```

---

## 3. Bedah Detail Setiap Berkas (File-by-File Breakdown)

Berikut adalah audit teknis menyeluruh berkas kode dalam aplikasi:

---

### A. Kategori Tata Letak (`src/layouts/`)

#### 1. `src/layouts/MainLayout.jsx`
* **Lokasi & Nama File**: `src/layouts/MainLayout.jsx`
* **Tanggung Jawab Utama**: Menyediakan kerangka halaman etalase publik yang konsisten untuk pembeli, membatasi lebar kontainer maksimal 1400px, serta menempatkan Navbar di bagian atas dan Footer di bagian bawah.
* **State, Hooks, & Props**:
  * Hooks: Tidak mengelola *state* internal; hanya mengonsumsi `<Outlet />` dari `react-router-dom`.
  * Props: Tidak menerima *props* langsung (mengambil anak rute via *Outlet*).
* **Keterhubungan Antar-File**: Mengimpor `Navbar` dari `../components/Navbar` dan `Outlet` dari `react-router-dom`. Diimpor oleh `src/App.jsx` sebagai elemen induk rute `/`.
* **Snippet Kode Kunci**:
```jsx
// src/layouts/MainLayout.jsx
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <Navbar />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        {/* Hak cipta dan link kebijakan toko */}
      </footer>
    </div>
  );
}
```

---

#### 2. `src/layouts/AdminLayout.jsx`
* **Lokasi & Nama File**: `src/layouts/AdminLayout.jsx`
* **Tanggung Jawab Utama**: Mengatur tata letak panel administrasi dengan bilah samping (`Sidebar`), *header* navigasi *mobile*, serta menerapkan **Route Guard** (proteksi rute) agar hanya akun berstatus admin yang dapat masuk.
* **State, Hooks, & Props**:
  * Hooks: `useState(false)` untuk kontrol visibilitas laci *sidebar mobile* (`sidebarOpen`); `useAuth()` untuk membaca data sesi `user`.
  * Props: Mengirimkan `sidebarOpen` dan `setSidebarOpen` ke komponen `Sidebar`.
* **Keterhubungan Antar-File**: Mengimpor `Sidebar` dari `../components/Sidebar`, `useAuth` dari `../utils/AuthContext`, dan `<Navigate />` dari `react-router-dom`. Diimpor oleh `src/App.jsx` sebagai induk rute `/admin`.
* **Snippet Kode Kunci**:
```jsx
// src/layouts/AdminLayout.jsx
const { user } = useAuth();
const [sidebarOpen, setSidebarOpen] = useState(false);

// Proteksi Rute Admin (Route Guard)
if (!user || user.role !== "admin") {
  return <Navigate to="/login" replace />;
}
```

---

### B. Kategori Komponen UI (`src/components/`)

#### 3. `src/components/Navbar.jsx`
* **Lokasi & Nama File**: `src/components/Navbar.jsx`
* **Tanggung Jawab Utama**: Menampilkan identitas toko (logo kotak "T TokoSaya"), tautan navigasi utama (*Dashboard*, *Keranjang*, *Checkout*, *Masuk/Keluar*), *badge counter* total barang, serta animasi *pop-up floating* kuantitas barang yang baru ditambahkan (+N).
* **State, Hooks, & Props**:
  * Hooks: `useState(false)` untuk menu *mobile*; `useState(0)` untuk `addedCount`; `useRef` untuk melacak kuantitas sebelumnya (`prevQtyRef`) dan ID *timer* (`timerRef`); `useEffect` untuk mendeteksi lonjakan kuantitas; `useCart()` dan `useAuth()`.
  * Props: Berdiri mandiri tanpa menerima *props* luar.
* **Keterhubungan Antar-File**: Mengonsumsi `useCart` (`totalQty`) dan `useAuth` (`user`); diimpor oleh `MainLayout.jsx`.
* **Snippet Kode Kunci**:
```jsx
// Logika Akumulasi & Timer 3 Detik saat terjadi penambahan keranjang
useEffect(() => {
  if (isInitialMount.current) {
    isInitialMount.current = false;
    prevQtyRef.current = totalQty;
    return;
  }
  const diff = totalQty - prevQtyRef.current;
  prevQtyRef.current = totalQty;

  if (diff > 0) {
    setAddedCount((prev) => prev + diff);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAddedCount(0);
    }, 3000);
  }
}, [totalQty]);
```

---

#### 4. `src/components/Sidebar.jsx`
* **Lokasi & Nama File**: `src/components/Sidebar.jsx`
* **Tanggung Jawab Utama**: Navigasi vertikal panel admin, penanda halaman aktif (*active link highlight* dengan garis tepi kiri ungu tegas), dan tombol pintasan kembali ke etalase publik.
* **State, Hooks, & Props**:
  * Hooks: `useLocation()` untuk membaca `pathname` URL saat ini guna menentukan status aktif.
  * Props: Menerima `sidebarOpen` (boolean) dan `setSidebarOpen` (fungsi dispatch) dari `AdminLayout.jsx`.
* **Keterhubungan Antar-File**: Diimpor oleh `AdminLayout.jsx`.
* **Snippet Kode Kunci**:
```jsx
// src/components/Sidebar.jsx
const location = useLocation();
const isDashboardActive =
  location.pathname === "/admin" ||
  location.pathname === "/admin/" ||
  location.pathname === "/admin/dashboard";
const isAboutActive = location.pathname === "/admin/about";
```

---

#### 5. `src/components/ProductCard.jsx`
* **Lokasi & Nama File**: `src/components/ProductCard.jsx`
* **Tanggung Jawab Utama**: Menampilkan informasi ringkas produk (gambar rasio persegi dengan *background* `#cbe3f7`, judul terpotong rapi, harga, bintang rating, barang terjual, nama toko), tautan ke detail produk, dan tombol `+ Keranjang`.
* **State, Hooks, & Props**:
  * Hooks: `useCart()` untuk mengambil fungsi `addToCart`.
  * Props: Menerima objek produk tunggal `p` (`{ id, name, slug, price, rawPrice, img, rating, sold, seller, ... }`).
* **Keterhubungan Antar-File**: Mengonsumsi `useCart` dari `../utils/CartContext`; diimpor oleh `Dashboard.jsx`.
* **Snippet Kode Kunci**:
```jsx
// src/components/ProductCard.jsx
export default function ProductCard({ p }) {
  const { addToCart } = useCart();
  return (
    <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition duration-200 rounded-none p-3.5 flex flex-col justify-between">
      {/* Wadah Gambar Square sudut tegas */}
      <div className="w-full aspect-square bg-[#cbe3f7] rounded-none overflow-hidden flex items-center justify-center">
        <img src={p.img} alt={p.name} className="w-full h-full object-cover rounded-none" />
      </div>
      ...
      <button
        onClick={() => addToCart(p)}
        className="bg-[#4F46E5] hover:bg-indigo-700 active:scale-95 text-white text-[12px] font-semibold px-2.5 py-1.5 rounded-none transition shadow-sm"
      >
        + Keranjang
      </button>
    </div>
  );
}
```

---

#### 6. `src/components/ProductFilterBar.jsx`
* **Lokasi & Nama File**: `src/components/ProductFilterBar.jsx`
* **Tanggung Jawab Utama**: Antarmuka kontrol etalase yang menyatukan kolom pencarian dengan tombol hapus cepat, tombol submit cari, *dropdown* pemilihan kategori dinamis, dan *dropdown* pengurutan harga.
* **State, Hooks, & Props**:
  * Hooks: Bersifat *Controlled Component* murni (tidak menyimpan state lokal).
  * Props: Menerima `keyword`, `setKeyword`, `selectedCategory`, `setSelectedCategory`, `sortBy`, `setSortBy`, dan array `categories`.
* **Keterhubungan Antar-File**: Diimpor dan dikendalikan sepenuhnya oleh `Dashboard.jsx`.
* **Snippet Kode Kunci**:
```jsx
// Dropdown Kategori Terkontrol
<select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="appearance-none bg-white border border-slate-300 text-slate-700 text-sm rounded-none pl-4 pr-10 py-2.5 focus:outline-none focus:border-[#4F46E5]"
>
  <option value="Semua">Semua Kategori</option>
  {categories.map((cat, index) => (
    <option key={index} value={cat}>{cat}</option>
  ))}
</select>
```

---

### C. Kategori Halaman Depan (`src/pages/frontpages/`)

#### 7. `src/pages/frontpages/Dashboard.jsx`
* **Lokasi & Nama File**: `src/pages/frontpages/Dashboard.jsx`
* **Tanggung Jawab Utama**: Katalog utama toko online; mengorkestrasi logika pemfilteran kategori, pencarian kata utuh (*whole word matching* berbasis regex), pengurutan harga (*sorting*), serta merender galeri kartu produk.
* **State, Hooks, & Props**:
  * Hooks: `useState("")` untuk `keyword`; `useState("Semua")` untuk `selectedCategory`; `useState("default")` untuk `sortBy`.
  * Props: Rute utama index (`/`).
* **Keterhubungan Antar-File**: Mengimpor `ProductFilterBar`, `ProductCard`, dan data `products.json`.
* **Snippet Kode Kunci**:
```jsx
// 1. Eksekusi Filter Pencarian & Kategori
const filteredProducts = products.filter((product) => {
  const matchCategory = selectedCategory === "Semua" || product.category_name === selectedCategory;

  let matchKeyword = true;
  if (keyword.trim() !== "") {
    const searchWords = keyword.toLowerCase().trim().split(/\s+/).filter(Boolean);
    matchKeyword = searchWords.every((word) => {
      const wordRegex = new RegExp(`\\b${word}\\b`, "i");
      return wordRegex.test(product.name);
    });
  }
  return matchCategory && matchKeyword;
});

// 2. Eksekusi Pengurutan Harga
const sortedProducts = [...filteredProducts].sort((a, b) => {
  if (sortBy === "lowest") return a.rawPrice - b.rawPrice;
  if (sortBy === "highest") return b.rawPrice - a.rawPrice;
  return a.id - b.id;
});
```

---

#### 8. `src/pages/frontpages/ProductDetail.jsx`
* **Lokasi & Nama File**: `src/pages/frontpages/ProductDetail.jsx`
* **Tanggung Jawab Utama**: Menampilkan halaman rincian produk lengkap berdasarkan URL *params*, pemilihan kuantitas beli, galeri ulasan pelanggan, serta formulir pengiriman ulasan baru yang disimpan ke `localStorage`.
* **State, Hooks, & Props**:
  * Hooks: `useParams()` (`slug`, `id`); `useLocation()` untuk menerima objek dari state router (jika ada); `useCart()`; `useState(1)` untuk `quantity`; `useState` untuk ulasan `reviews` dengan inisialisasi *lazy LocalStorage*; `useEffect` untuk sinkronisasi saat URL berganti.
* **Keterhubungan Antar-File**: Mengimpor `useCart` dari `../../utils/CartContext` dan `products.json`.
* **Snippet Kode Kunci**:
```jsx
// src/pages/frontpages/ProductDetail.jsx
const { slug, id } = useParams();
const targetParam = slug || id;

const product =
  location.state ||
  products.find((p) => String(p.slug) === String(targetParam) || String(p.id) === String(targetParam)) ||
  products[0];

const storageKey = `reviews_${product.slug}`;

// Sinkronisasi Ulasan ke LocalStorage
const [reviews, setReviews] = useState(() => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialReviews;
  } catch {
    return initialReviews;
  }
});
```

---

#### 9. `src/pages/frontpages/Cart.jsx`
* **Lokasi & Nama File**: `src/pages/frontpages/Cart.jsx`
* **Tanggung Jawab Utama**: Menampilkan daftar belanjaan pengguna, perubahan kuantitas item (+/-), penghapusan item individual atau pengosongan seluruh keranjang dengan **modal konfirmasi pop-up interaktif kustom**, serta ringkasan subtotal harga.
* **State, Hooks, & Props**:
  * Hooks: `useCart()` (`cart`, `updateQty`, `removeFromCart`, `clearCart`, `totalPrice`, `totalQty`); `useState` untuk modal konfirmasi `{ isOpen: false, type: "item", item: null }`.
* **Keterhubungan Antar-File**: Mengonsumsi `useCart` dari `../../utils/CartContext`.
* **Snippet Kode Kunci**:
```jsx
// Trigger konfirmasi modal sebelum aksi mutasi destruktif
const handleRequestRemoveItem = (item) => {
  setConfirmModal({ isOpen: true, type: "single_item", item });
};

const handleConfirmAction = () => {
  if (confirmModal.type === "clear_all") {
    clearCart();
  } else if (confirmModal.type === "single_item" && confirmModal.item) {
    removeFromCart(confirmModal.item.id);
  }
  setConfirmModal({ isOpen: false, type: null, item: null });
};
```

---

#### 10. `src/pages/frontpages/Checkout.jsx`
* **Lokasi & Nama File**: `src/pages/frontpages/Checkout.jsx`
* **Tanggung Jawab Utama**: Mengumpulkan data pengiriman pembeli (nama, nomor telepon, alamat, kota, kode pos), opsi pengiriman (Reguler Gratis vs Express Rp20.000), pilihan metode pembayaran (QRIS, Transfer Bank, COD), kalkulasi total final, pembuatan nomor *invoice* unik (`#INV-2026-XXXX`), penyimpanan ke `localStorage` (`toko_orders`), dan menampilkan dialog umpan balik pesanan berhasil.
* **State, Hooks, & Props**:
  * Hooks: `useCart()` (`cart`, `totalPrice`, `totalQty`, `clearCart`); `useNavigate()`; `useState` untuk `formData`, `shippingOption`, `paymentMethod`, `isOrderSuccess`, `orderCode`.
* **Keterhubungan Antar-File**: Mengonsumsi `useCart` dari `../../utils/CartContext`.
* **Snippet Kode Kunci**:
```jsx
// src/pages/frontpages/Checkout.jsx
const handleSubmitOrder = (e) => {
  e.preventDefault();
  if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
    setErrorMsg("Harap lengkapi semua data informasi pengiriman.");
    return;
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `#INV-2026-${randomNum}`;
  setOrderCode(code);

  // Simpan Transaksi Sukses ke LocalStorage
  const orderData = { invoiceId: code, date: new Date().toISOString(), customer: formData, items: cart, grandTotal };
  const existingOrders = JSON.parse(localStorage.getItem("toko_orders") || "[]");
  localStorage.setItem("toko_orders", JSON.stringify([orderData, ...existingOrders]));

  clearCart();
  setIsOrderSuccess(true);
};
```

---

### D. Kategori Halaman Admin & Autentikasi (`src/pages/adminpages/` & `src/pages/`)

#### 11. `src/pages/LoginPage.jsx`
* **Lokasi & Nama File**: `src/pages/LoginPage.jsx`
* **Tanggung Jawab Utama**: Formulir masuk akun admin dengan dukungan *show/hide password*, validasi kredensial administrator, notifikasi *banner* jika sandi salah, dan pengalihan ke `/admin/dashboard` bila sukses.
* **State, Hooks, & Props**:
  * Hooks: `useState("")` untuk `email`, `password`, `errorMsg`; `useState(false)` untuk `showPassword`; `useAuth()`; `useNavigate()`.
* **Keterhubungan Antar-File**: Mengonsumsi fungsi `login` dari `AuthContext.jsx`.
* **Snippet Kode Kunci**:
```jsx
// src/pages/LoginPage.jsx
const handleSubmit = (e) => {
  e.preventDefault();
  setErrorMsg("");
  const result = login(email, password);
  if (result.success) {
    navigate("/admin/dashboard");
  } else {
    setErrorMsg(result.message);
  }
};
```

---

#### 12. `src/pages/LogoutPage.jsx`
* **Lokasi & Nama File**: `src/pages/LogoutPage.jsx`
* **Tanggung Jawab Utama**: Halaman konfirmasi terminasi sesi. Menghapus data sesi dari `AuthContext` & `localStorage`, lalu mengarahkan kembali ke `/login`.
* **State, Hooks, & Props**:
  * Hooks: `useAuth()` (`logout`); `useNavigate()`.
* **Keterhubungan Antar-File**: Mengonsumsi `logout` dari `AuthContext.jsx`.
* **Snippet Kode Kunci**:
```jsx
// src/pages/LogoutPage.jsx
const handleConfirmLogout = () => {
  logout();
  navigate("/login");
};
```

---

#### 13. `src/pages/adminpages/AdminDashboard.jsx`
* **Lokasi & Nama File**: `src/pages/adminpages/AdminDashboard.jsx`
* **Tanggung Jawab Utama**: Menampilkan metrik ringkas toko (Total Produk per kategori yang dihitung otomatis, Pesanan Masuk, Estimasi Omset Pendapatan), status operasional server lokal, dan tombol aksi cepat.
* **State, Hooks, & Props**:
  * Hooks: Mengimpor `products.json` untuk kalkulasi dinamis.
* **Keterhubungan Antar-File**: Membaca data dari `../../data/products.json`.
* **Snippet Kode Kunci**:
```jsx
// Menghitung jumlah produk per kategori otomatis
const categoryCount = products.reduce((acc, p) => {
  acc[p.category_name] = (acc[p.category_name] || 0) + 1;
  return acc;
}, {});
```

---

#### 14. `src/pages/adminpages/AboutPage.jsx`
* **Lokasi & Nama File**: `src/pages/adminpages/AboutPage.jsx`
* **Tanggung Jawab Utama**: Dokumentasi arsitektur statis yang menyajikan rincian teknis modul, sistem desain, serta spesifikasi pengembang aplikasi.
* **State, Hooks, & Props**: Statis, tidak memiliki state kompleks.
* **Keterhubungan Antar-File**: Diimpor oleh `src/App.jsx`.

---

### E. Kategori State Global & Basis Data (`src/utils/` & `src/data/`)

#### 15. `src/utils/AuthContext.jsx`
* **Lokasi & Nama File**: `src/utils/AuthContext.jsx`
* **Tanggung Jawab Utama**: Menyimpan status autentikasi administrator (`user`), memvalidasi kredensial *hardcoded*, serta melakukan persistensi sesi ke kunci `toko_user` di browser.
* **State, Hooks, & Props**:
  * State: `user` (diinisialisasi dari `localStorage.getItem("toko_user")`).
  * Fungsi API yang diekspos: `login(email, password)`, `logout()`.
* **Keterhubungan Antar-File**: Membungkus seluruh aplikasi di `main.jsx`; dikonsumsi via *custom hook* `useAuth()`.
* **Snippet Kode Kunci**:
```jsx
// src/utils/AuthContext.jsx
const login = (email, password) => {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPassword = (password || "").trim();

  if (cleanEmail === "admin@gmail.com" && cleanPassword === "admin12345") {
    const userData = { email: "admin@gmail.com", role: "admin", name: "Administrator" };
    setUser(userData);
    localStorage.setItem("toko_user", JSON.stringify(userData));
    return { success: true, user: userData };
  }
  return { success: false, message: "Email atau password yang Anda masukkan salah." };
};
```

---

#### 16. `src/utils/CartContext.jsx`
* **Lokasi & Nama File**: `src/utils/CartContext.jsx`
* **Tanggung Jawab Utama**: Menjadi *Single Source of Truth* untuk keranjang belanja. Menangani penambahan produk, modifikasi kuantitas, penghapusan, kalkulasi total item dan rupiah, serta persistensi otomatis ke `toko_saya_cart`.
* **State, Hooks, & Props**:
  * State: `cart` (diinisialisasi dari `localStorage.getItem("toko_saya_cart")`).
  * Effect: `useEffect` otomatis menyimpan perubahan `cart` ke `localStorage`.
  * Nilai yang diekspos: `cart`, `addToCart`, `removeFromCart`, `updateQty`, `clearCart`, `totalQty`, `totalPrice`.
* **Keterhubungan Antar-File**: Membungkus aplikasi di `main.jsx`; dikonsumsi oleh `Navbar`, `ProductCard`, `ProductDetail`, `Cart`, dan `Checkout` via hook `useCart()`.
* **Snippet Kode Kunci**:
```jsx
// src/utils/CartContext.jsx
const addToCart = (product) => {
  setCart((prevCart) => {
    const existingIndex = prevCart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
      const updated = [...prevCart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        qty: (updated[existingIndex].qty || 1) + 1,
      };
      return updated;
    } else {
      return [...prevCart, { ...product, qty: 1 }];
    }
  });
};

const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
const totalPrice = cart.reduce((sum, item) => sum + (item.rawPrice || 0) * (item.qty || 0), 0);
```

---

#### 17. `src/data/products.json`
* **Lokasi & Nama File**: `src/data/products.json`
* **Tanggung Jawab Utama**: Basis data lokal (dummy data) berisi 16 item produk dengan struktur data lengkap:
  * `id` (Number): Pengidentifikasi unik.
  * `name` (String): Nama lengkap produk (contoh: "Sneakers Sporty Pastel Pink").
  * `slug` (String): URL slug ramah SEO (contoh: `sneakers-sporty-pastel-pink`).
  * `category_name` (String): Kategori barang ("Sepatu", "Aksesori", "Tas", "Pakaian").
  * `price` (String): Harga format Rupiah display ("Rp420.000").
  * `rawPrice` (Number): Harga integer murni untuk kalkulasi matematis (`420000`).
  * `original_price` (String): Harga sebelum diskon untuk tampilan coret.
  * `rating` & `sold`: Kredibilitas produk ("4,5" dan "12 Terjual").
  * `seller`: Nama toko penjual ("TokoSeller.com").
  * `img`: URL aset foto produk (Unsplash HD).
  * `desc` / `description`: Deskripsi mendalam spesifikasi produk.

---

## 4. Alur Kerja Fitur-Fitur Kunci (Feature Workflow)

### a. Katalog Produk & Filter/Search
```
[ Input Keyword / Pilih Kategori / Pilih Urutan ]
                     │
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │ 1. Filter Kategori:                                    │
  │    selectedCategory === "Semua" || p.category === ... │
  │                                                        │
  │ 2. Filter Kata Utuh (Word Boundary Matching):          │
  │    keyword.split(/\s+/) ──> for each word:             │
  │    new RegExp(`\\b${word}\\b`, "i").test(p.name)       │
  │                                                        │
  │ 3. Pengurutan (Sorting):                               │
  │    "lowest"  ──> a.rawPrice - b.rawPrice               │
  │    "highest" ──> b.rawPrice - a.rawPrice               │
  │    "default" ──> a.id - b.id                           │
  └────────────────────────────────────────────────────────┘
                     │
                     ▼
           [ Render Grid Produk ]
```
1. **Pemisahan Token Kata**: Input pengguna dipotong berdasarkan spasi menggunakan regex `.split(/\s+/)`.
2. **Pencocokan Kata Utuh**: Setiap kata diuji terhadap nama produk menggunakan ekspresi reguler `\bword\b`. Hal ini memastikan bahwa pencarian kata "Tas" tidak akan salah mencocokkan kata "Pastel" (karena substring "tas" ada di dalam pas**tas** / pas**tel**).
3. **Pengurutan Harga**: Array yang lolos filter diurutkan berdasarkan `rawPrice` secara *ascending* (`lowest`) atau *descending* (`highest`).

---

### b. Manajemen Keranjang (Cart State & LocalStorage)
```
[ Klik "+ Keranjang" di Card / Detail ]
                    │
                    ▼
     [ Eksekusi addToCart(product) ]
                    │
       Ada di Cart? ├──── YA ────> qty = qty + 1
                    │
                    └──── TIDAK ──> append { ...product, qty: 1 }
                    │
                    ▼
     [ useEffect CartContext ] ──> localStorage.setItem("toko_saya_cart")
                    │
                    ▼
     [ Navbar mendeteksi perubahan totalQty ]
                    │
  ┌─────────────────┴──────────────────┐
  ▼                                    ▼
[ Badge Merah Counter Terupdate ]     [ Popup Float "+1" Aktif Selama 3 Detik ]
```
1. **Penambahan Data**: Fungsi `addToCart` memeriksa apakah produk dengan `id` sama sudah ada dalam array. Jika ada, kuantitas di-inkremen; jika belum, dimasukkan sebagai entri baru dengan `qty: 1`.
2. **Persistensi Browser**: Hook `useEffect` di `CartContext` segera menyerialisasi array `cart` ke JSON dan menyimpannya di kunci `toko_saya_cart`.
3. **Feedback Visual Navbar**: `Navbar` membandingkan `totalQty` saat ini dengan `prevQtyRef.current`. Jika terjadi selisih positif, *state* `addedCount` dinaikkan dan *timer* 3 detik dipicu untuk menyembunyikan notifikasi secara elegan.

---

### c. Checkout Sederhana & Feedback Pesanan
```
[ Isi Form Alamat & Pilih Ekspedisi/Bayar ]
                    │
                    ▼
          [ Validasi Form Data ]
                    │
       Lengkap? ────┼── TIDAK ──> Munculkan Pesan Error Merah
                    │
                    └── YA
                    │
                    ▼
  ┌────────────────────────────────────────────────────────┐
  │ 1. Buat Kode Faktur Acak (#INV-2026-XXXX)              │
  │ 2. Simpan Transaksi ke localStorage ("toko_orders")    │
  │ 3. Panggil clearCart() (Kosongkan Keranjang)           │
  │ 4. Tampilkan Dialog Modal Sukses Transaksi             │
  └────────────────────────────────────────────────────────┘
```
1. Pengguna melengkapi formulir pengiriman (nama, telepon, alamat, kota) dan memilih opsi pengiriman (Reguler/Express).
2. Sistem memvalidasi kelengkapan data wajib (*mandatory fields*).
3. Kode pesanan unik di-*generate* (format `#INV-2026-XXXX`).
4. Detail transaksi disimpan ke array `toko_orders` di `localStorage`.
5. Fungsi `clearCart()` dipanggil untuk mereset keranjang belanja.
6. Halaman memunculkan dialog konfirmasi sukses yang memuat nomor faktur, rincian biaya, dan tombol cetak bukti pembayaran.

---

### d. Detail Produk & Sistem Review Lokal
```
[ Klik Kartu Produk ] ──> Navigasi ke /product/:slug (atau :id)
                                    │
                                    ▼
                [ useParams() membaca :slug atau :id ]
                                    │
                                    ▼
             [ products.find((p) => p.slug === targetParam) ]
                                    │
                                    ▼
          [ Ambil Ulasan dari localStorage: `reviews_${product.slug}` ]
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
       [ Form Kirim Review Baru ]       [ Daftar Review Pelanggan ]
                    │
                    ▼
       [ Simpan ke LocalStorage ]
```
1. Pengguna membuka URL seperti `/product/sneakers-sporty-pastel-pink`.
2. Komponen `ProductDetail` membaca parameter via `useParams()`.
3. Produk dicari di `products.json` menggunakan `.find()`.
4. Sistem membaca ulasan tersimpan di kunci unik `reviews_${product.slug}` di `localStorage`.
5. Pengguna dapat memilih bintang rating (1-5) dan mengetik ulasan; ulasan baru langsung disisipkan di atas (*unshift*) dan disinkronkan ke `localStorage`.

---

### e. Autentikasi Sederhana Admin & Route Guard
```
[ User Mengakses /admin atau /admin/dashboard ]
                     │
                     ▼
           [ AdminLayout Dieksekusi ]
                     │
        Cek Status Sesi di AuthContext
                     │
        user && user.role === "admin"?
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
     [ YA ]                     [ TIDAK ]
       │                           │
  [ Tampilkan ]                    ▼
  [ AdminLayout & Outlet ]   [ <Navigate to="/login" replace /> ]
                                   │
                                   ▼
                           [ Form Login Admin ]
                             Email: admin@gmail.com
                             Sandi: admin12345
```
1. Akses ke rute berawalan `/admin` dicegat oleh penjaga rute (*Route Guard*) di `AdminLayout.jsx`.
2. Jika objek `user` kosong atau `role !== "admin"`, komponen langsung mengembalikan `<Navigate to="/login" replace />`.
3. Pada halaman `LoginPage`, input divalidasi terhadap kredensial administrator:
   * **Email**: `admin@gmail.com`
   * **Kata Sandi**: `admin12345`
4. Jika cocok, data sesi disimpan ke `localStorage` (`toko_user`) dan pengguna diarahkan ke `/admin/dashboard`.

---

## 5. Cheat Sheet Modifikasi Kode (Developer Quick-Reference)

Panduan praktis bagi pengembang yang ingin memodifikasi atau mengembangkan fitur aplikasi ini lebih lanjut:

| Kebutuhan Pengembang | File Sasaran yang Harus Diubah | Bagian / Baris Kode yang Dimodifikasi | Contoh Penerapan / Panduan |
| :--- | :--- | :--- | :--- |
| **Menambah / Mengubah Data Katalog Produk** | `src/data/products.json` | Tambahkan objek baru ke dalam array JSON | Pastikan menyertakan properti wajib: `id` (unik), `name`, `slug`, `category_name`, `price`, `rawPrice` (angka murni), dan `img`. |
| **Mengubah Logika Pencarian Menjadi Substring Fleksibel** | `src/pages/frontpages/Dashboard.jsx` | Blok `matchKeyword` di dalam fungsi `products.filter(...)` | Ganti regex kata utuh `\b${word}\b` dengan metode standar `.includes()`: <br> `matchKeyword = product.name.toLowerCase().includes(keyword.toLowerCase().trim());` |
| **Menambah / Menghapus Kategori Filter** | `src/data/products.json` | Properti `"category_name"` pada masing-masing produk | Kategori pada dropdown diekstrak secara otomatis menggunakan `[...new Set(products.map(p => p.category_name))]`. Cukup ubah nilai kategori pada data produk. |
| **Menambah Halaman Publik Baru** (misal: `/faq`) | 1. `src/pages/frontpages/Faq.jsx`<br>2. `src/App.jsx`<br>3. `src/components/Navbar.jsx` | Daftarkan rute baru di `App.jsx` di dalam blok `MainLayout` | 1. Buat komponen `Faq.jsx`.<br>2. Tambahkan `<Route path="faq" element={<Faq />} />` di bawah rute `MainLayout`.<br>3. Tambahkan `<Link to="/faq">` di `Navbar.jsx`. |
| **Menambah Halaman Admin Baru** (misal: `/admin/orders`) | 1. `src/pages/adminpages/OrdersPage.jsx`<br>2. `src/App.jsx`<br>3. `src/components/Sidebar.jsx` | Daftarkan rute baru di `App.jsx` di dalam blok `AdminLayout` | 1. Buat komponen `OrdersPage.jsx`.<br>2. Tambahkan `<Route path="orders" element={<OrdersPage />} />` di dalam rute `AdminLayout`.<br>3. Tambahkan tautan `<Link to="/admin/orders">` pada navigasi `Sidebar.jsx`. |
| **Mengubah Gaya / Tata Letak Navbar** | `src/components/Navbar.jsx` | Elemen `<nav>` dan kontainer `max-w-[1400px]` | Ganti warna latar belakang (misal dari `bg-[#4F46E5]` menjadi `bg-slate-900`) atau modifikasi posisi ikon keranjang dan menu navigasi. |
| **Mengubah Gaya Sudut Tegas (Sharp Edges) ke Sudut Membulat (Rounded)** | 1. `src/index.css`<br>2. Kelas Tailwind di komponen | Hapus aturan `border-radius: 0px` atau ganti kelas `rounded-none` menjadi `rounded-lg` / `rounded-xl` | Di `index.css` atau elemen komponen, ganti kelas `rounded-none` dengan `rounded-md` atau `rounded-xl` untuk mengubah estetika neo-minimalist menjadi rounded modern. |
| **Mengubah Kredensial Login Administrator** | `src/utils/AuthContext.jsx` | Fungsi `login(email, password)` | Ubah string pembanding kredensial: <br> `if (cleanEmail === "newadmin@domain.com" && cleanPassword === "rahasia123")` |
| **Mengubah Opsi & Biaya Ekspedisi Pengiriman** | `src/pages/frontpages/Checkout.jsx` | Variabel `shippingCost` & elemen radio button pengiriman | Ubah logika kalkulasi: <br> `const shippingCost = shippingOption === "express" ? 25000 : shippingOption === "sameday" ? 40000 : 0;` |

---

## 6. Kesimpulan Hasil Audit

Proyek **TokoSaya E-Commerce** dibangun dengan standar arsitektur React modern yang sangat baik:
1. **Separation of Concerns**: Struktur kode rapi dengan pemisahan tegas antara tata letak rute (*layouts*), halaman tampilan (*pages*), komponen antarmuka modular (*components*), dan utilitas status global (*utils*).
2. **Pemanfaatan Context API Efisien**: Penggunaan `CartContext` dan `AuthContext` membebaskan kode dari masalah *prop drilling*, serta menjaga data tetap persisten di browser (*LocalStorage*) tanpa ketergantungan pustaka pihak ketiga yang berlebihan.
3. **Pola Navigasi Modern**: Penerapan *Nested Routes* dan `<Outlet />` dari `react-router-dom` v7 menyederhanakan pengelolaan rute publik dan rute panel admin terproteksi (*Route Guard*).
4. **Desain Sistem Konsisten**: Penerapan prinsip *Neo-Minimalist Sharp Edges* (`rounded-none`) dan tipografi *Canva Sans* menciptakan identitas visual yang profesional, bersih, dan berkarakter tegas.
