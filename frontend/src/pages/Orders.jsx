import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../api/axios"

export default function Orders() {
    const { data: orders, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: () => api.get("/orders/").then(r => r.data),
    })

    // We might want to fetch products too, to show images or names
    const { data: products } = useQuery({
        queryKey: ["products"],
        queryFn: () => api.get("/products/").then(r => r.data),
    })

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto fade-in">
            <div className="mb-10">
                <h1 className="text-4xl font-bold">Your Orders</h1>
                <p className="text-[#8a8780] mt-1">View your order history and status</p>
            </div>

            {!orders?.length ? (
                <div className="text-center py-16 bg-white border border-[#e8e2d8] rounded-2xl">
                    <p className="text-4xl mb-4">📦</p>
                    <h2 className="text-xl font-bold mb-2">No orders yet</h2>
                    <p className="text-[#8a8780] mb-6">Looks like you haven't bought anything yet.</p>
                    <Link to="/products" className="px-6 py-2 bg-[#1a1a18] text-white rounded-xl hover:bg-[#c8622a] transition-colors">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {orders.map((order, i) => (
                        <div key={order.id} className={`bg-white border border-[#e8e2d8] rounded-2xl p-6 fade-up delay-${Math.min(i + 1, 3)}`}>
                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-[#e8e2d8]">
                                <div>
                                    <p className="text-sm font-medium text-[#8a8780]">Order #{order.id}</p>
                                    <p className="text-[#1a1a18] mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    <p className="font-bold text-[#c8622a]">${order.total_price.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {order.items?.map(item => {
                                    const product = products?.find(p => p.id === item.product_id)
                                    return (
                                        <div key={item.id} className="flex items-center gap-4">
                                            {product && (
                                                <div className="w-16 h-16 bg-[#f0ebe1] rounded-lg overflow-hidden shrink-0">
                                                    <img src={`http://127.0.0.1:8000/${product.image_path}`} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium text-[#1a1a18]">{product?.name || `Product #${item.product_id}`}</p>
                                                <p className="text-sm text-[#8a8780]">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
