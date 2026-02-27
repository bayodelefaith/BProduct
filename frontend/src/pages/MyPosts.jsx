import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api/axios"

export default function MyPosts() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ title: "", content: "" })
  const [open, setOpen] = useState(false)

  const { data: posts, isLoading } = useQuery({
    queryKey: ["my-posts"],
    queryFn: async () => {
      const me = await api.get("/me")
      const all = await api.get("/posts/")
      return all.data.filter(p => p.user_id === me.data.id)
    },
  })

  const create = useMutation({
    mutationFn: () => api.post("/posts/", form),
    onSuccess: () => {
      queryClient.invalidateQueries(["my-posts"])
      setForm({ title: "", content: "" })
      setOpen(false)
    },
  })

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["my-posts"]),
  })

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-bold mb-2">My Posts</h1>
          <p className="text-[#8a8780]">{posts?.length} post{posts?.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="bg-[#1a1a18] text-[#faf8f4] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#c8622a] transition-colors duration-200"
        >
          {open ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {open && (
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 mb-6 fade-up">
          <h2 className="font-semibold text-lg mb-4">New Post</h2>
          <div className="flex flex-col gap-3">
            <input
              className="border border-[#e8e2d8] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c8622a] focus:ring-2 focus:ring-[#c8622a]/10 transition"
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="border border-[#e8e2d8] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c8622a] focus:ring-2 focus:ring-[#c8622a]/10 transition resize-none"
              placeholder="Write something..."
              rows={4}
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />
            <button
              onClick={() => create.mutate()}
              disabled={!form.title || !form.content}
              className="bg-[#1a1a18] text-[#faf8f4] py-3 rounded-xl text-sm font-medium hover:bg-[#c8622a] transition-colors duration-200 disabled:opacity-40"
            >
              Publish
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {posts?.length === 0 && (
          <div className="text-center py-16 text-[#8a8780]">
            <p className="text-4xl mb-3">✍️</p>
            <p>You haven't posted anything yet</p>
          </div>
        )}
        {posts?.map((post, i) => (
          <div
            key={post.id}
            className={`group bg-white border border-[#e8e2d8] rounded-2xl p-6 hover:border-[#c8622a]/30 transition-colors fade-up delay-${Math.min(i + 1, 3)}`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="font-semibold text-lg mb-1">{post.title}</h2>
                <p className="text-[#8a8780] text-sm leading-relaxed">{post.content}</p>
              </div>
              <button
                onClick={() => remove.mutate(post.id)}
                className="opacity-0 group-hover:opacity-100 text-xs text-[#8a8780] hover:text-red-500 transition-all px-2 py-1 rounded-lg hover:bg-red-50 shrink-0"
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