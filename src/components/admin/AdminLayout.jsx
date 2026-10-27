import { useAuth } from '../../context/AuthContext';
import { LogOut, Plus, FileText, ExternalLink, ShieldCheck, FolderGit2, Users } from 'lucide-react';

export default function AdminLayout({
  children,
  currentAdminView = 'blog-list',
  onNavigate = () => {},
  title = 'Admin Panel',
}) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('admin-login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Badge */}
            <div className="flex items-center gap-3">
              <a
                href="/admin/blog"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('admin-blog');
                }}
                className="flex items-center gap-2 font-mono font-bold text-base tracking-tight text-white hover:text-semesta transition-colors"
              >
                <span className="w-3 h-3 bg-semesta inline-block" />
                <span>sumestawsome</span>
              </a>
              <span className="bg-semesta/20 text-semesta border border-semesta/40 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-none flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> CMS Admin
              </span>
            </div>

            {/* Admin Links */}
            <nav className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-mono">
              {/* Menu Karya */}
              <button
                type="button"
                onClick={() => onNavigate('admin-karya')}
                className={`px-2.5 sm:px-3 py-1.5 transition-colors border rounded-none flex items-center gap-1.5 ${
                  currentAdminView.startsWith('karya')
                    ? 'bg-semesta text-white border-semesta font-bold'
                    : 'text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white bg-zinc-900'
                }`}
                title="Kelola Portofolio Karya"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Karya</span>
              </button>

              {/* Menu Blog */}
              <button
                type="button"
                onClick={() => onNavigate('admin-blog')}
                className={`px-2.5 sm:px-3 py-1.5 transition-colors border rounded-none flex items-center gap-1.5 ${
                  currentAdminView.startsWith('blog')
                    ? 'bg-semesta text-white border-semesta font-bold'
                    : 'text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white bg-zinc-900'
                }`}
                title="Kelola Artikel Blog"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Blog</span>
              </button>

              {/* Menu Penulis */}
              <button
                type="button"
                onClick={() => onNavigate('admin-authors')}
                className={`px-2.5 sm:px-3 py-1.5 transition-colors border rounded-none flex items-center gap-1.5 ${
                  currentAdminView.startsWith('author')
                    ? 'bg-semesta text-white border-semesta font-bold'
                    : 'text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white bg-zinc-900'
                }`}
                title="Kelola Profil Penulis"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Penulis</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('karya')}
                className="px-2.5 sm:px-3 py-1.5 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-none hidden md:flex items-center gap-1"
                title="Lihat katalog publik"
              >
                <span>Lihat Web</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              {/* User Email & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <span className="text-zinc-400 text-xs hidden lg:inline max-w-[150px] truncate">
                  {user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-none transition-colors"
                  title="Keluar dari akun admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-xs font-mono text-zinc-600">
        sumestawsome.xyz Admin CMS • Firebase Cloud Firestore Engine
      </footer>
    </div>
  );
}
