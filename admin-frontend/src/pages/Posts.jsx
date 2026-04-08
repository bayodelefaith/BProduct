import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Trash2, Search } from 'lucide-react';

export default function Posts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const res = await api.get('/posts');
      return res.data;
    }
  });

  const deletePost = useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      toast.success('Post removed from platform');
      queryClient.invalidateQueries(['admin-posts']);
    }
  });

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) || 
    (post.user?.name && post.user.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) return <div className="p-8 text-[#8a8780]">Loading posts...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Content Moderation</h1>
          <p className="text-[#8a8780] text-sm">Review community posts and remove inappropriate content.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8780]" size={16} />
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-white text-sm focus:outline-none focus:border-[#c8622a] w-72"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPosts?.map(post => (
          <div key={post.id} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 group hover:border-[#333] transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xs text-[#8a8780] font-bold">
                  {post.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">{post.user?.name || 'Unknown User'}</h3>
                  <p className="text-[#8a8780] text-xs">Post ID: #{post.id} • Likes: {post.likes}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm('Remove this post entirely? This action cannot be undone.')) deletePost.mutate(post.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-[#8a8780] hover:text-red-500 transition-opacity bg-[#141414] hover:bg-red-500/10 p-2 rounded-lg"
                title="Delete Post"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="bg-[#141414] p-4 rounded-xl border border-[#1f1f1f]">
              <h4 className="text-white font-semibold mb-2">{post.title}</h4>
              <p className="text-[#8a8780] text-sm leading-relaxed">{post.content}</p>
            </div>
          </div>
        ))}
        {filteredPosts?.length === 0 && (
          <div className="p-16 text-center text-[#8a8780] border border-dashed border-[#1f1f1f] rounded-2xl">
            {search ? 'No posts match your search query.' : 'All caught up! No posts found in the system.'}
          </div>
        )}
      </div>
    </div>
  );
}
