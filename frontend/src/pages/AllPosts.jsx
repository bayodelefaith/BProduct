import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"

function PostItem({ post, index }) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const { isAuth } = useAuth()
  const queryClient = useQueryClient()

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => api.get(`/posts/${post.id}/comments`).then(r => r.data),
    enabled: showComments
  })

  const addComment = useMutation({
    mutationFn: () => api.post(`/posts/${post.id}/comments`, { content: commentText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] })
      setCommentText("")
    }
  })

  return (
    <div className={`bg-white border border-[#e8e2d8] rounded-2xl p-6 transition-colors shadow-sm fade-up delay-${Math.min(index + 1, 3)}`}>
      <div className="flex justify-between items-start mb-2">
        <Link to={`/posts/${post.id}`} className="font-semibold text-xl text-[#1a1a18] hover:text-[#c8622a] transition-colors">{post.title}</Link>
        {post.category && (
          <span className="text-xs font-medium text-[#c8622a] bg-[#f0ebe1] px-2.5 py-1 rounded-md uppercase tracking-wider">
            {post.category}
          </span>
        )}
      </div>
      <p className="text-[#8a8780] leading-relaxed text-sm mb-5">{post.content}</p>

      <div className="flex gap-5 text-sm font-medium text-[#8a8780] border-t border-[#e8e2d8] pt-4">
        <span className="flex items-center gap-1.5 cursor-default hover:text-[#1a1a18] transition-colors">
          <span className="text-[#c8622a] text-lg leading-none">❤</span> {post.likes}
        </span>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 hover:text-[#1a1a18] transition-colors text-[#1a1a18]"
        >
          <span className="text-lg leading-none">💬</span> {showComments ? 'Hide Comments' : 'Comment'}
        </button>
      </div>

      {showComments && (
        <div className="mt-5 pt-5 border-t border-[#e8e2d8]">
          {isAuth ? (
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                 onKeyDown={e => {
                  if (e.key === 'Enter' && commentText.trim() && !addComment.isPending) {
                    addComment.mutate()
                  }
                }}
                className="flex-1 p-3 rounded-xl border border-[#e8e2d8] outline-none text-sm focus:border-[#c8622a] transition-colors bg-[#faf8f4]"
              />
              <button
                onClick={() => addComment.mutate()}
                disabled={!commentText.trim() || addComment.isPending}
                className="px-5 py-2.5 bg-[#1a1a18] text-[#faf8f4] text-sm font-medium rounded-xl hover:bg-[#c8622a] disabled:opacity-50 transition-colors"
               >
                Post
              </button>
            </div>
          ) : (
            <div className="text-center p-4 mb-6 bg-[#f0ebe1] rounded-xl text-sm text-[#8a8780]">
              <Link to="/login" className="text-[#c8622a] font-medium hover:underline">Log in</Link> to join the discussion.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {isLoadingComments ? (
               <p className="text-xs text-[#8a8780] text-center py-2">Loading comments...</p>
            ) : comments?.length === 0 ? (
               <p className="text-xs text-[#8a8780] text-center py-2">No comments yet. Be the first to start the conversation!</p>
            ) : (
               comments?.map(c => (
                 <div key={c.id} className="bg-[#faf8f4] p-4 rounded-xl border border-[#e8e2d8]">
                   <div className="flex items-center gap-2 mb-1.5">
                     <span className="font-semibold text-xs text-[#1a1a18] bg-[#e8e2d8] px-2 py-0.5 rounded-full">User {c.user_id}</span>
                     <span className="text-[10px] text-[#8a8780]">
                       {new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                     </span>
                   </div>
                   <p className="text-sm text-[#1a1a18] leading-relaxed">{c.content}</p>
                 </div>
               ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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

  // Rest of AllPosts remains similar, mapped out to use PostItem

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

      <div className="flex flex-col gap-5">
        {posts?.map((post, i) => (
          <PostItem key={post.id} post={post} index={i} />
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
          className="px-6 py-2.5 rounded-xl bg-white border border-[#e8e2d8] text-[#1a1a18] text-sm font-medium hover:bg-[#f0ebe1] disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!posts || posts.length < limit}
          className="px-6 py-2.5 rounded-xl bg-white border border-[#e8e2d8] text-[#1a1a18] text-sm font-medium hover:bg-[#f0ebe1] disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}