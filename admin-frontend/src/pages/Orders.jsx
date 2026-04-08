import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Search, ChevronDown, ChevronUp, Package } from 'lucide-react';

export default function Orders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries(['admin-orders']);
    }
  });

  const filteredOrders = orders?.filter(o => 
    String(o.id).includes(search) || 
    (o.user?.name && o.user.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (isLoading) return <div className="p-8 text-[#8a8780]">Loading orders...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Order Fulfillment</h1>
          <p className="text-[#8a8780] text-sm">Process customer orders and update shipping statuses.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8780]" size={16} />
          <input 
            type="text" 
            placeholder="Search Order ID or Name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-white text-sm focus:outline-none focus:border-[#c8622a] w-72"
          />
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f1f1f] bg-[#141414]">
              <th className="p-4 w-12 text-center text-[#8a8780]"></th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Order ID</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Customer</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Total Value</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm">Date</th>
              <th className="p-4 text-[#8a8780] font-medium text-sm text-right">Status Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map(order => (
              <React.Fragment key={order.id}>
                <tr className={`border-b border-[#1f1f1f] hover:bg-[#141414]/50 transition ${expandedOrderId === order.id ? 'bg-[#141414]/30' : ''}`}>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleExpand(order.id)}
                      className="text-[#8a8780] hover:text-white transition"
                    >
                      {expandedOrderId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </td>
                  <td className="p-4 text-white font-medium">#{order.id}</td>
                  <td className="p-4 text-[#8a8780] text-sm">{order.user?.name || 'Guest'}</td>
                  <td className="p-4 text-emerald-500 font-semibold">${order.total_price.toFixed(2)}</td>
                  <td className="p-4 text-[#8a8780] text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                      className={`appearance-none bg-[#141414] border border-[#333] px-3 py-1.5 text-sm rounded-lg font-medium cursor-pointer focus:outline-none focus:border-[#c8622a] ${
                        order.status === 'pending' ? 'text-orange-500' :
                        order.status === 'shipped' ? 'text-blue-500' :
                        order.status === 'delivered' ? 'text-emerald-500' : 'text-[#8a8780]'
                      }`}
                    >
                      <option value="pending" className="text-orange-500">Pending</option>
                      <option value="shipped" className="text-blue-500">Shipped</option>
                      <option value="delivered" className="text-emerald-500">Delivered</option>
                      <option value="cancelled" className="text-red-500">Cancelled</option>
                    </select>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr className="bg-[#101010] border-b border-[#1f1f1f]">
                    <td colSpan="6" className="p-6">
                      <div className="flex flex-col gap-4 max-w-3xl">
                        <h4 className="text-white font-medium text-sm flex items-center gap-2">
                          <Package size={16} className="text-[#c8622a]" /> Order Items
                        </h4>
                        {!order.orderitem || order.orderitem.length === 0 ? (
                           <p className="text-[#8a8780] text-sm italic">No line items found for this order.</p>
                        ) : (
                           <div className="grid grid-cols-1 divide-y divide-[#1f1f1f] bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
                             {order.orderitem.map((item, idx) => (
                               <div key={idx} className="flex justify-between items-center p-4">
                                 <div>
                                   <p className="text-white text-sm font-medium">{item.product?.name || `Product #${item.product_id}`}</p>
                                   <p className="text-[#8a8780] text-xs mt-1">Unit Price: ${item.price.toFixed(2)}</p>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-white text-sm font-medium">Qty: {item.quantity}</p>
                                   <p className="text-[#8a8780] text-xs mt-1">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                                 </div>
                               </div>
                             ))}
                           </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredOrders?.length === 0 && (
              <tr>
                <td colSpan="6" className="p-10 text-center text-[#8a8780]">
                  {search ? 'No orders match your search query.' : 'No orders have been placed yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
