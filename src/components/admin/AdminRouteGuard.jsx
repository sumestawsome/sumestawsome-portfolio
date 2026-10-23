import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminRouteGuard({ children, onNavigate = () => {} }) {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      onNavigate('admin-login');
    }
  }, [loading, isAuthenticated, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-zinc-100 font-mono text-sm bg-zinc-800 border border-zinc-700 px-6 py-4 rounded-none">
          <Loader2 className="w-5 h-5 text-semesta animate-spin" />
          <span>Memverifikasi otentikasi admin...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border-2 border-red-500/50 p-8 rounded-none text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2 font-mono">Akses Terbatas</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Anda harus masuk menggunakan akun administrator untuk mengakses panel kontrol ini.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('admin-login')}
            className="w-full bg-semesta hover:bg-semesta/90 text-white font-semibold py-2.5 px-4 rounded-none font-mono text-sm transition-colors"
          >
            Menuju Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
