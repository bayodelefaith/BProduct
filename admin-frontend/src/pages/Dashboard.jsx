import { useQuery } from '@tanstack/react-query';
import { Users, Package, FileText, ShoppingCart } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/stats');
      return res.data;
    }
  });

  const cards = [
    { label: 'Total Users', value: stats?.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Products', value: stats?.products, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Posts', value: stats?.posts, icon: FileText, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'Total Orders', value: stats?.orders, icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
      <p className="text-[#8a8780] mb-8">Welcome back, Admin. Here's what's happening today.</p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
           {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[#1a1a1a] rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 relative overflow-hidden group hover:border-[#333] transition-colors">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-[#8a8780] text-sm font-medium mb-1">{card.label}</h3>
                  <p className="text-3xl font-bold text-white">{card.value?.toLocaleString() || 0}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
