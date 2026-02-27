import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../api/axios"

export default function AdminProducts() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: "", description: "", price: "", quantity: "" })
  const [image, setImage] = useState(null)
  const [error, setError] = useState("")

  if (!isAdmin) {
    navigate("/")
    return null
  }

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.get("/admin/products").then(r => r.data),
  })

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", quantity: "" })
    setImage(null)
    setEditProduct(null)
    setShowForm(false)
    setError("")
  }

  const create = useMutation({
    mutationFn: () => {
      const data = new FormData()
      data.append("name", form.name)
      data.append("description", form.description)
      data.append("price", form.price)
      data.append("quantity", form.quantity)
      console.log(form.quantity)
      data.append("image", image)
      return api.post("/products/", data)
    },
    onSuccess: () => { queryClient.invalidateQueries(["admin-products"]); resetForm() },
    onError: (e) => setError(e.response?.data?.detail || "Failed to create product"),
  })

  const update = useMutation({
    mutationFn: () => {
      const data = new FormData()
      if (form.name) data.append("name", form.name)
      if (form.description) data.append("description", form.description)
      if (form.price) data.append("price", form.price)
      if (form.quantity) data.append("quantity", form.quantity)
      if (image) data.append("image", image)
      return api.put(`/products/${editProduct.id}`, data)
    },
    onSuccess: () => { queryClient.invalidateQueries(["admin-products"]); resetForm() },
    onError: (e) => setError(e.response?.data?.detail || "Failed to update product"),
  })

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/admin/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["admin-products"]),
  })

  const startEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    })
    setShowForm(true)
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-xs font-medium text-[#c8622a] uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-4xl font-bold">Manage Products</h1>
          <p className="text-[#8a8780] mt-1">{products?.length} products total</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="bg-[#1a1a18] text-[#faf8f4] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#c8622a] transition-colors duration-200"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 mb-8 fade-up">
          <h2 className="font-semibold text-lg mb-5">
            {editProduct ? `Editing: ${editProduct.name}` : "New Product"}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "name", label: "Name", placeholder: "Product name" },
              { key: "price", label: "Price", placeholder: "0.00" },
              { key: "quantity", label: "Quantity", placeholder: "0" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{label}</label>
                <input
                  className="border border-[#e8e2d8] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c8622a] focus:ring-2 focus:ring-[#c8622a]/10 transition"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Image {editProduct && "(leave empty to keep current)"}</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files[0])}
                className="border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#c8622a] transition file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-[#f0ebe1] file:text-[#1a1a18] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="border border-[#e8e2d8] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c8622a] focus:ring-2 focus:ring-[#c8622a]/10 transition resize-none"
                placeholder="Product description"
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => editProduct ? update.mutate() : create.mutate()}
              disabled={!editProduct && (!form.name || !form.price || !form.quantity || !image)}
              className="bg-[#1a1a18] text-[#faf8f4] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#c8622a] transition-colors duration-200 disabled:opacity-40"
            >
              {editProduct ? "Save Changes" : "Create Product"}
            </button>
            <button onClick={resetForm} className="text-sm text-[#8a8780] hover:text-[#1a1a18] transition-colors px-4">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-[#e8e2d8] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_80px_80px_100px_120px] gap-4 px-5 py-3 border-b border-[#e8e2d8] text-xs font-medium text-[#8a8780] uppercase tracking-wider">
          <span>Image</span>
          <span>Name</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Owner</span>
          <span>Actions</span>
        </div>

        {products?.map((product, i) => (
          <div
            key={product.id}
            className={`grid grid-cols-[60px_1fr_80px_80px_100px_120px] gap-4 px-5 py-4 items-center border-b border-[#e8e2d8] last:border-0 hover:bg-[#faf8f4] transition-colors fade-up delay-${Math.min(i + 1, 3)}`}
          >
            <img
              src={`http://127.0.0.1:8000/${product.image_path}`}
              alt={product.name}
              className="w-10 h-10 object-cover rounded-lg bg-[#f0ebe1]"
            />
            <div>
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-[#8a8780] truncate max-w-xs">{product.description}</p>
            </div>
            <span className="text-sm font-medium text-[#c8622a]">${product.price}</span>
            <span className={`text-sm font-medium ${product.quantity === 0 ? "text-red-500" : "text-[#1a1a18]"}`}>
              {product.quantity}
            </span>
            <span className="text-xs text-[#8a8780]">#{product.user_id}</span>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(product)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#f0ebe1] text-[#1a1a18] hover:bg-[#c8622a] hover:text-white transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => remove.mutate(product.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}