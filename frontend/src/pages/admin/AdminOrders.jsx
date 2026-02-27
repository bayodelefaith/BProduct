import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../api/axios"

export default function AdminOrders() {
    const queryClient = useQueryClient()

    const { data: orders, isLoading } = useQuery({
        queryKey: ["admin_orders"],
        queryFn: () => api.get("/admin/orders").then(r => r.data),
    })

    const { data: products } = useQuery({
        queryKey: ["admin_products_lookup"],
        queryFn: () => api.get("/products/").then(r => r.data),
    })

    const updateStatus = useMutation({
        mutationFn: ({ id, status }) => {
            const formData = new FormData()
            formData.append("status", status)
            return api.patch(`/admin/orders/${id}/status`, formData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["admin_orders"])
        }
    })

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto fade-in">
            <h1 className="text-4xl font-bold mb-8">Manage Orders</h1>

            <div className="bg-white border border-[#e8e2d8] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f0ebe1] text-[#1a1a18] text-sm font-semibold border-b border-[#e8e2d8]">
                                <th className="p-4 rounded-tl-xl w-24">Order ID</th>
                                <th className="p-4 w-32">Date</th>
                                <th className="p-4 w-32">Total</th>
                                <th className="p-4">Items</th>
                                <th className="p-4 rounded-tr-xl w-48 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders?.map(order => (
                                <tr key={order.id} className="border-b border-[#e8e2d8] last:border-0 hover:bg-[#faf8f4] transition-colors text-sm">
                                    <td className="p-4 font-medium text-[#1a1a18]">#{order.id}</td>
                                    <td className="p-4 text-[#8a8780]">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 font-semibold text-[#c8622a]">${order.total_price.toFixed(2)}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-[#8a8780]">
                                            {order.items?.map(i => {
                                                const productName = products?.find(p => p.id === i.product_id)?.name || `Product #${i.product_id}`
                                                return <span key={i.id}>{i.quantity}x {productName}</span>
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <select
                                            className="text-sm rounded-lg p-2 border border-[#e8e2d8] outline-none focus:border-[#c8622a] hover:bg-[#f0ebe1] cursor-pointer"
                                            value={order.status}
                                            disabled={updateStatus.isPending}
                                            onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {(!orders || orders.length === 0) && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-[#8a8780]">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
