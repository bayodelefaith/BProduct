import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Trash2, ShieldAlert, Search } from 'lucide-react';

export default function Users() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    }
  });

  const deleteUser = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries(['admin-users']);
    }
  });

  const promoteUser = useMutation({
    mutationFn: (id) => api.put(`/users/${id}/promote`),
    onSuccess: () => {
      toast.success('User promoted to Admin');
      queryClient.invalidateQueries(['admin-users']);
    }
  });

  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-[#8a8780]">Loading users...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Manage Users</h1>
          <div className="flex items-center gap-3">
            <span className="bg-[#1a1a1a] text-[#8a8780] px-4 py-1.5 rounded-full text-sm font-medium">
              {users?.length} Total
            </span>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8780]" size={16} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-white text-sm focus:outline-none focus:border-[#c8622a] w-64"
          />
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f1f1f] bg-[#141414]">
              <th className="p-4 text-[#8a8780] font-medium text-sm">ID</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Name</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Email</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Role</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map(user => (
              <tr key={user.id} className="border-b border-[#1f1f1f] hover:bg-[#141414]/50 transition">
                <td className="p-4 text-[#8a8780] text-sm">#{user.id}</td>
                <td className="p-4 text-white font-medium">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img src={`http://localhost:8000/${user.avatar_url}`} alt="" className="w-8 h-8 rounded-full object-cover border border-[#333]" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xs text-[#8a8780] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {user.name}
                  </div>
                </td>
                <td className="p-4 text-[#8a8780] text-sm">{user.email}</td>
                <td className="p-4">
                  {user.is_admin ? (
                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-semibold">Admin</span>
                  ) : (
                    <span className="bg-[#1a1a1a] text-[#8a8780] px-3 py-1 rounded-full text-xs font-semibold">User</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3 text-[#8a8780]">
                    {!user.is_admin && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Promote to Admin?')) promoteUser.mutate(user.id);
                        }}
                        className="hover:text-emerald-500 transition tooltip" title="Promote to Admin"
                      >
                        <ShieldAlert size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (window.confirm('Delete user entirely?')) deleteUser.mutate(user.id);
                      }}
                      className="hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers?.length === 0 && (
              <tr>
                <td colSpan="5" className="p-10 text-center text-[#8a8780]">
                  {search ? 'No users match your search query.' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
