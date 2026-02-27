import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

export default function Cart() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: items, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get("/cart/").then(r => r.data),
  })

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/cart/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["cart"]),
  })

  const clear = useMutation({
    mutationFn: () => api.delete("/cart/"),
    onSuccess: () => queryClient.invalidateQueries(["cart"]),
  })

  const checkout = useMutation({
    mutationFn: () => api.post("/orders/"),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"])
      queryClient.invalidateQueries(["orders"])
      navigate("/orders")
    },
  })

  // Also query products to show names instead of just IDs
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products/").then(r => r.data),
  })

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!items?.length) return (
    <div className="flex flex-col items-center justify-center h-64 text-center fade-in">
      <p className="text-5xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-[#8a8780]">Add some products to get started</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Your Cart</h1>
          <p className="text-[#8a8780] mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => clear.mutate()}
          className="text-sm text-[#8a8780] hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const product = products?.find(p => p.id === item.product_id)
          return (
            <div
              key={item.id}
              className={`bg-white border border-[#e8e2d8] rounded-2xl p-5 flex justify-between items-center fade-up delay-${Math.min(i + 1, 3)}`}
            >
              <div>
                <p className="font-medium text-[#1a1a18]">{product?.name || `Product #${item.product_id}`}</p>
                <p className="text-sm text-[#8a8780] mt-0.5">Qty: {item.quantity} {product ? `• $${product.price * item.quantity}` : ''}</p>
              </div>
              <button
                onClick={() => remove.mutate(item.id)}
                className="text-sm text-[#8a8780] hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-5 bg-[#f0ebe1] rounded-2xl">
        <button
          onClick={() => checkout.mutate()}
          disabled={checkout.isPending}
          className="w-full bg-[#1a1a18] text-[#faf8f4] py-3 rounded-xl text-sm font-medium hover:bg-[#c8622a] disabled:opacity-50 transition-colors duration-200"
        >
          {checkout.isPending ? "Processing..." : "Checkout"}
        </button>
      </div>
    </div>
  )
}