import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLogin({ onNavigate = () => {} }) {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Jika sudah terautentikasi, otomatis redirect ke dashboard blog
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      onNavigate('admin-blog');
    }
  }, [isAuthenticated, authLoading, onNavigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Harap masukkan email dan kata sandi.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      onNavigate('admin-blog');
    } catch (err) {
      console.error('Login error:', err);
      let message = 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        message = 'Kredensial tidak valid. Email atau kata sandi salah.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Terlalu banyak percobaan gagal. Silakan coba beberapa saat lagi.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Gagal terhubung ke jaringan. Periksa koneksi internet Anda.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-semesta/10 border-2 border-semesta mb-3 rounded-none text-semesta">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Admin CMS Portal
          </h1>
          <p className="text-zinc-400 text-sm mt-1 font-mono">
            sumestawsome.xyz • Manajemen Blog & Konten
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-none">
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/50 rounded-none text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-mono text-xs leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sumestawsome.xyz"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-zinc-100 text-sm pl-10 pr-4 py-2.5 rounded-none outline-none transition-colors font-mono"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-semesta text-zinc-100 text-sm pl-10 pr-4 py-2.5 rounded-none outline-none transition-colors font-mono"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-semesta hover:bg-semesta/90 text-white font-semibold py-3 px-4 rounded-none text-sm transition-colors flex items-center justify-center gap-2 group font-mono disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-xs font-mono text-zinc-400 hover:text-semesta transition-colors"
            >
              &larr; Kembali ke Beranda Publik
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
