import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, ShoppingCart, LogOut } from 'lucide-react';
import axios from 'axios';

export default function DashboardLayout({ onLogout }) {
  const location = useLocation();

  const links = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/posts', icon: FileText, label: 'Posts' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  ];

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Notify backend to invalidate refresh token
    if (refreshToken) {
      try {
        await axios.post('http://localhost:3001/admin/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout notification failed:', error);
      }
    }
    
    // Clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    onLogout();
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <aside className="w-64 border-r border-[#1f1f1f] bg-[#0a0a0a] flex flex-col">
        <div className="p-6 border-b border-[#1f1f1f]">
          <h1 className="text-xl text-white font-bold tracking-wider">ADMIN<span className="text-[#c8622a]">PANEL</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map(link => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active ? 'bg-[#c8622a] text-white' : 'text-[#8a8780] hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-[#1f1f1f]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-[#8a8780] hover:text-white hover:bg-[#1a1a1a] transition rounded-xl"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto bg-[#141414]">
        <Outlet />
      </main>
    </div>
  );
}
