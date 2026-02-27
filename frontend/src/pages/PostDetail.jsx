import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

export default function PostDetail() {
    const { id } = useParams()
    const { isAuth } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [commentText, setCommentText] = useState("")

    const { data: post, isLoading: isPostLoading } = useQuery({
        queryKey: ["post", id],
        queryFn: () => api.get(`/posts/${id}`).then(r => r.data),
    })

    // To fetch the author's name we might need a separate endpoint or user details, 
    // but let's stick to showing the user_id or 'Unknown' for now if not included in post response.

    const { data: comments } = useQuery({
        queryKey: ["comments", id],
        queryFn: () => api.get(`/posts/${id}/comments`).then(r => r.data),
    })

    const addComment = useMutation({
        mutationFn: () => api.post(`/posts/${id}/comments`, { content: commentText }),
        onSuccess: () => {
            queryClient.invalidateQueries(["comments", id])
            setCommentText("")
        }
    })

    const likePost = useMutation({
        mutationFn: () => api.post(`/posts/${id}/like`),
        onSuccess: () => {
            queryClient.invalidateQueries(["post", id])
            queryClient.invalidateQueries(["posts"])
        }
    })

    if (isPostLoading || !post) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto fade-up">
            <button onClick={() => navigate("/posts")} className="text-sm text-[#8a8780] hover:text-[#1a1a18] mb-6 flex items-center gap-1 transition-colors">
                ← Back to Feed
            </button>

            <div className="bg-white border border-[#e8e2d8] rounded-3xl p-8 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-[#1a1a18]">{post.title}</h1>
                    {post.category && (
                        <span className="text-xs font-medium text-[#c8622a] bg-[#f0ebe1] px-3 py-1.5 rounded-lg uppercase tracking-wider">
                            {post.category}
                        </span>
                    )}
                </div>

                <p className="text-[#1a1a18] leading-relaxed text-lg mb-8 whitespace-pre-wrap">{post.content}</p>

                <div className="flex items-center gap-4 text-sm font-medium border-t border-[#e8e2d8] pt-6">
                    <button
                        onClick={() => {
                            if (!isAuth) return navigate("/login")
                            likePost.mutate()
                        }}
                        disabled={likePost.isPending}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${likePost.isPending ? 'opacity-50' : 'hover:bg-[#f0ebe1]'} text-[#c8622a]`}
                    >
                        <span className="text-xl">❤</span> {post.likes} Likes
                    </button>
                    <span className="text-[#8a8780] flex items-center gap-2">
                        <span className="text-xl">💬</span> {comments?.length || 0} Comments
                    </span>
                </div>
            </div>

            <div className="mb-10">
                <h3 className="text-xl font-bold mb-6">Discussion</h3>

                {isAuth ? (
                    <div className="flex gap-4 mb-8 items-start">
                        <div className="w-10 h-10 rounded-full bg-[#f0ebe1] shrink-0"></div>
                        <div className="flex-1 bg-white border border-[#e8e2d8] rounded-2xl overflow-hidden focus-within:border-[#c8622a] focus-within:ring-1 focus-within:ring-[#c8622a] transition-all">
                            <textarea
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full p-4 outline-none resize-none min-h-[100px]"
                            />
                            <div className="bg-[#faf8f4] py-2 px-4 flex justify-end border-t border-[#e8e2d8]">
                                <button
                                    onClick={() => addComment.mutate()}
                                    disabled={!commentText.trim() || addComment.isPending}
                                    className="px-6 py-2 bg-[#1a1a18] text-[#faf8f4] font-medium text-sm rounded-xl hover:bg-[#c8622a] disabled:opacity-50 transition-colors"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#faf8f4] border border-[#e8e2d8] rounded-2xl p-6 text-center mb-8">
                        <p className="text-[#8a8780] mb-3">You must be logged in to join the discussion.</p>
                        <button onClick={() => navigate("/login")} className="text-sm font-medium text-[#c8622a] hover:underline">
                            Log in or Register
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {(!comments || comments.length === 0) ? (
                        <p className="text-center text-[#8a8780] py-8">No comments yet. Start the conversation!</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#e8e2d8] shrink-0 flex items-center justify-center text-xs font-bold text-[#8a8780]">
                                    U{comment.user_id}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-[#1a1a18]">User {comment.user_id}</span>
                                        <span className="text-xs text-[#8a8780]">
                                            {new Date(comment.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-[#1a1a18] text-sm leading-relaxed bg-white p-4 rounded-2xl border border-[#e8e2d8] rounded-tl-sm">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
