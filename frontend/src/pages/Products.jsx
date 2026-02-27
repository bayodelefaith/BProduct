import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../api/axios"

export default function Products() {
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(0)
  const limit = 9 // 9 products per page

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search, category, page],
    queryFn: () => api.get("/products/", {
      params: { search: search || undefined, category: category || undefined, skip: page * limit, limit }
    }).then(r => r.data),
  })

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="fade-in">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-5xl font-bold mb-2">Shop</h1>
          <p className="text-[#8a8780]">Discover our collection</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <form className="flex-1 sm:w-64" onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(0); }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e8e2d8] focus:border-[#c8622a] outline-none text-sm bg-white"
            />
          </form>
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(0); }}
            className="p-2.5 rounded-xl border border-[#e8e2d8] focus:border-[#c8622a] outline-none text-sm bg-white cursor-pointer min-w-[110px]"
          >
            <option value="">All</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home</option>
            <option value="books">Books</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products?.map((product, i) => (
          <Link
            to={`/products/${product.id}`}
            key={product.id}
            className={`fade-up delay-${Math.min(i + 1, 3)}`}
          >
            <div className="group bg-white rounded-2xl overflow-hidden border border-[#e8e2d8] hover:border-[#c8622a]/30 hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden h-52 bg-[#f0ebe1]">
                <img
                  src={`http://127.0.0.1:8000/${product.image_path}`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">
                      Out of stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-[#1a1a18] truncate">{product.name}</h2>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[#c8622a] font-semibold">${product.price}</span>
                  <span className="text-xs text-[#8a8780]">{product.quantity} left</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {products?.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#8a8780]">
            No products match your criteria.
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-center gap-4 border-t border-[#e8e2d8] pt-8">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-6 py-2 rounded-xl bg-white border border-[#e8e2d8] text-[#1a1a18] text-sm font-medium hover:bg-[#f0ebe1] disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!products || products.length < limit}
          className="px-6 py-2 rounded-xl bg-white border border-[#e8e2d8] text-[#1a1a18] text-sm font-medium hover:bg-[#f0ebe1] disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}