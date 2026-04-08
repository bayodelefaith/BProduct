import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Trash2, Edit, PackagePlus, Search } from 'lucide-react';

export default function Products() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: null, name: '', description: '', price: '', quantity: '', category: '', image_path: 'placeholder' });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data;
    }
  });

  const deleteProduct = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete product';
      toast.error(errorMessage);
    }
  });

  const addProduct = useMutation({
    mutationFn: () => api.post('/products', {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity)
    }),
    onSuccess: () => {
      toast.success('Product created');
      queryClient.invalidateQueries(['admin-products']);
      setOpen(false);
      setForm({ id: null, name: '', description: '', price: '', quantity: '', category: '', image_path: 'placeholder' });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create product';
      toast.error(errorMessage);
    }
  });

  const editProduct = useMutation({
    mutationFn: () => api.put(`/products/${form.id}`, {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity)
    }),
    onSuccess: () => {
      toast.success('Product updated');
      queryClient.invalidateQueries(['admin-products']);
      setOpen(false);
      setIsEditing(false);
      setForm({ id: null, name: '', description: '', price: '', quantity: '', category: '', image_path: 'placeholder' });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update product';
      toast.error(errorMessage);
    }
  });

  const handleEditClick = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: product.category || '',
      image_path: product.image_path
    });
    setIsEditing(true);
    setOpen(true);
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) return <div className="p-8 text-[#8a8780]">Loading products...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Manage Products</h1>
          <p className="text-[#8a8780] text-sm">Create, edit, or remove inventory items across the platform.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8780]" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-white text-sm focus:outline-none focus:border-[#c8622a] w-64"
            />
          </div>
          <button 
            onClick={() => {
              setForm({ id: null, name: '', description: '', price: '', quantity: '', category: '', image_path: 'placeholder' });
              setIsEditing(false);
              setOpen(!open);
            }}
            className="bg-[#c8622a] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#a65020] transition flex items-center gap-2"
          >
            <PackagePlus size={18} />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 mb-8 mt-2 shadow-2xl animate-fade-in">
          <h2 className="text-white font-semibold mb-4">{isEditing ? 'Edit Product' : 'Add Product (Admin Override)'}</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input 
              placeholder="Product Name" 
              className="bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8622a]"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            />
            <input 
              placeholder="Category" 
              className="bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8622a]"
              value={form.category} onChange={e => setForm({...form, category: e.target.value})}
            />
            <input 
              placeholder="Price" type="number" 
              className="bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8622a]"
              value={form.price} onChange={e => setForm({...form, price: e.target.value})}
            />
            <input 
              placeholder="Stock Quantity" type="number" 
              className="bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8622a]"
              value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
            />
          </div>
          <textarea 
            placeholder="Description..." rows="3"
            className="w-full bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-[#c8622a]"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          />
          <div className="flex justify-end gap-3">
             <button onClick={() => { setOpen(false); setIsEditing(false); }} className="text-[#8a8780] hover:text-white px-4 py-2 rounded-xl">Cancel</button>
             <button 
                onClick={() => isEditing ? editProduct.mutate() : addProduct.mutate()} 
                disabled={addProduct.isPending || editProduct.isPending}
                className="bg-[#c8622a] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#a65020] disabled:opacity-50"
             >
                {isEditing ? 'Save Changes' : 'Save to Inventory'}
             </button>
          </div>
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f1f1f] bg-[#141414]">
              <th className="p-4 text-[#8a8780] font-medium text-sm">Product</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Category</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Owner</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Price</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Stock</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts?.map(p => (
              <tr key={p.id} className="border-b border-[#1f1f1f] hover:bg-[#141414]/50 transition">
                <td className="p-4 text-white font-medium">{p.name}</td>
                <td className="p-4 text-[#8a8780] text-sm">
                  <span className="bg-[#1a1a1a] px-2 py-1 rounded-md">{p.category || 'Uncategorized'}</span>
                </td>
                <td className="p-4 text-[#8a8780] text-sm">{p.user?.name || 'System'}</td>
                <td className="p-4 text-emerald-500 font-semibold">${p.price}</td>
                <td className="p-4">
                  {p.quantity === 0 ? (
                    <span className="text-red-500 font-medium bg-red-500/10 px-2.5 py-1 rounded-md">Out of Stock</span>
                  ) : p.quantity < 5 ? (
                    <span className="text-orange-500 font-medium bg-orange-500/10 px-2.5 py-1 rounded-md">Low ({p.quantity})</span>
                  ) : (
                    <span className="text-[#8a8780]">{p.quantity} Units</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3 text-[#8a8780]">
                    <button 
                      onClick={() => handleEditClick(p)}
                      className="hover:text-white transition tooltip" title="Edit Product"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Delete ${p.name}?`)) deleteProduct.mutate(p.id);
                      }}
                      className="hover:text-red-500 transition tooltip" title="Delete Product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts?.length === 0 && (
              <tr>
                <td colSpan="6" className="p-10 text-center text-[#8a8780]">
                  {search ? 'No products match your search query.' : 'No products. Add one above!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
