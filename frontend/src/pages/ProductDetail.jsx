import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

export default function ProductDetail() {
  const { id } = useParams()
  const { isAuth } = useAuth()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState({ text: "", type: "" })

  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data),
  })

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.get(`/products/${id}/reviews`).then(r => r.data),
  })

  const addReview = useMutation({
    mutationFn: () => api.post(`/products/${id}/reviews`, { rating, comment: reviewComment }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", id])
      setReviewComment("")
      setRating(5)
    }
  })

  const addToCart = async () => {
    if (!isAuth) return navigate("/login")
    try {
      await api.post("/cart/", { product_id: product.id, quantity })
      setMessage({ text: "Added to cart!", type: "success" })
    } catch (e) {
      setMessage({ text: e.response?.data?.detail || "Failed to add", type: "error" })
    }
  }

  if (isProductLoading || !product) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto fade-up">
      <button onClick={() => navigate(-1)} className="text-sm text-[#8a8780] hover:text-[#1a1a18] mb-6 flex items-center gap-1 transition-colors">
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="rounded-2xl overflow-hidden bg-[#f0ebe1] aspect-square">
          <img
            src={`http://127.0.0.1:8000/${product.image_path}`}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-medium text-[#c8622a] uppercase tracking-widest mb-2">Product</p>
          <h1 className="text-4xl font-bold mb-3">{product.name}</h1>
          <p className="text-[#8a8780] leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-[#c8622a]">${product.price}</span>
          </div>
          <p className="text-sm text-[#8a8780] mb-8">{product.quantity} in stock</p>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-[#e8e2d8] rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, (typeof q === 'number' ? q : 1) - 1))}
                className="px-4 py-3 text-[#8a8780] hover:bg-[#f0ebe1] transition-colors"
              >−</button>
              <input
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (e.target.value === "") {
                    setQuantity("");
                  } else if (!isNaN(val)) {
                    setQuantity(Math.min(product.quantity, Math.max(1, val)));
                  }
                }}
                onBlur={() => {
                  if (quantity === "" || isNaN(quantity) || quantity < 1) {
                    setQuantity(1);
                  }
                }}
                className="w-16 text-center py-3 font-medium text-sm outline-none bg-transparent [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setQuantity(q => Math.min(product.quantity, (typeof q === 'number' ? q : 1) + 1))}
                className="px-4 py-3 text-[#8a8780] hover:bg-[#f0ebe1] transition-colors"
              >+</button>
            </div>
            <button
              onClick={addToCart}
              disabled={product.quantity === 0}
              className="flex-1 bg-[#1a1a18] text-[#faf8f4] py-3 rounded-xl text-sm font-medium hover:bg-[#c8622a] transition-colors duration-200 disabled:opacity-40"
            >
              {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {message.text && (
            <p className={`mt-4 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-[#e8e2d8] pt-10">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>

        {isAuth && (
          <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 mb-8">
            <h3 className="font-semibold mb-4 text-lg">Write a review</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-[#8a8780] block mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="p-2 border border-[#e8e2d8] rounded-xl outline-none focus:border-[#c8622a] bg-white w-32"
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{num} Stars</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#8a8780] block mb-1">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows="3"
                  className="w-full p-3 border border-[#e8e2d8] rounded-xl outline-none focus:border-[#c8622a] resize-none"
                  placeholder="What did you think of this product?"
                ></textarea>
              </div>
              <button
                onClick={() => addReview.mutate()}
                disabled={addReview.isPending || !reviewComment.trim()}
                className="self-start px-6 py-2 bg-[#1a1a18] text-[#faf8f4] rounded-xl hover:bg-[#c8622a] disabled:opacity-50 transition-colors font-medium text-sm"
              >
                {addReview.isPending ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {reviews?.length === 0 ? (
            <p className="text-[#8a8780] bg-white p-6 rounded-2xl border border-[#e8e2d8] text-center">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews?.map(review => (
              <div key={review.id} className="bg-white border border-[#e8e2d8] rounded-2xl p-6">
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex text-[#c8622a] text-lg">
                        {Array(review.rating).fill('★').join('')}
                        <span className="text-[#e8e2d8]">
                          {Array(5 - review.rating).fill('★').join('')}
                        </span>
                      </div>
                      <span className="text-sm text-[#8a8780]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#1a1a18] leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}