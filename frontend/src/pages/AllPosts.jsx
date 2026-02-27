import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../api/axios"

export default function AllPosts() {
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(0)
  const limit = 10

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", search, category, page],
    queryFn: () => api.get("/posts/", {
      params: { search: search || undefined, category: category || undefined, skip: page * limit, limit }
    }).then(r => r.data),
  })

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-5xl font-bold mb-2">Feed</h1>
          <p className="text-[#8a8780]">What people are sharing</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <form className="flex-1 sm:w-64" onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(0); }}>
            <input
              type="text"
              placeholder="Search posts..."
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
            <option value="discussion">Discussion</option>
            <option value="review">Review</option>
            <option value="question">Question</option>
            <option value="tips">Tips & Tricks</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {posts?.map((post, i) => (
          <Link
            to={`/posts/${post.id}`}
            key={post.id}
            className={`block bg-white border border-[#e8e2d8] rounded-2xl p-6 hover:border-[#c8622a]/30 transition-colors fade-up delay-${Math.min(i + 1, 3)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-semibold text-lg">{post.title}</h2>
              {post.category && (
                <span className="text-xs font-medium text-[#c8622a] bg-[#f0ebe1] px-2 py-1 rounded-md uppercase">
                  {post.category}
                </span>
              )}
            </div>
            <p className="text-[#8a8780] leading-relaxed text-sm line-clamp-3">{post.content}</p>
            <div className="mt-4 flex gap-4 text-xs font-medium text-[#8a8780]">
              <span className="flex items-center gap-1">❤ {post.likes}</span>
              <span className="flex items-center gap-1">💬 View Comments</span>
            </div>
          </Link>
        ))}
        {posts?.length === 0 && (
          <div className="text-center py-12 text-[#8a8780] bg-white border border-[#e8e2d8] rounded-2xl">
            No posts match your criteria.
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-center gap-4 border-t border-[#e8e2d8] pt-8">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-6 py-2 rounded-xl bg-white border border-[#e8e2d8] text-[#1a1a18] text-sm font-medium hover:bg-[#f0ebe1] disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!posts || posts.length < limit}
          className="px-6 py-2 rounded-xl bg-white border border-[#e8e2d8] text-[#1a1a18] text-sm font-medium hover:bg-[#f0ebe1] disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}