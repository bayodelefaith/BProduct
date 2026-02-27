import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api/axios"

export default function Profile() {
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")

    const { data: user, isLoading } = useQuery({
        queryKey: ["me"],
        queryFn: () => api.get("/me").then(r => r.data),
    })

    useEffect(() => {
        if (user && !isEditing) {
            setName(user.name || "")
            setBio(user.bio || "")
        }
    }, [user, isEditing])

    const updateProfile = useMutation({
        mutationFn: (data) => api.put("/users/me", data),
        onSuccess: () => {
            queryClient.invalidateQueries(["me"])
            setIsEditing(false)
        }
    })

    const uploadAvatar = useMutation({
        mutationFn: (file) => {
            const formData = new FormData()
            formData.append("avatar", file)
            return api.post("/users/me/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
        },
        onSuccess: () => queryClient.invalidateQueries(["me"])
    })

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="max-w-2xl mx-auto fade-in">
            <h1 className="text-4xl font-bold mb-8">Your Profile</h1>

            <div className="bg-white border border-[#e8e2d8] rounded-2xl p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-[#f0ebe1] overflow-hidden flex items-center justify-center border-4 border-white shadow-sm">
                            {user?.avatar_url ? (
                                <img src={`http://127.0.0.1:8000/${user.avatar_url}`} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl text-[#8a8780]">{user?.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity z-10 text-xs font-medium">
                            Change
                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                                if (e.target.files[0]) uploadAvatar.mutate(e.target.files[0])
                            }} />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#1a1a18]">{user?.name}</h2>
                        <p className="text-[#8a8780]">{user?.email}</p>
                    </div>
                </div>

                {isEditing ? (
                    <form className="flex flex-col gap-4" onSubmit={e => {
                        e.preventDefault()
                        updateProfile.mutate({ name, bio })
                    }}>
                        <div>
                            <label className="block text-sm font-medium text-[#8a8780] mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-3 rounded-xl border border-[#e8e2d8] focus:border-[#c8622a] focus:ring-1 focus:ring-[#c8622a] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#8a8780] mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                rows={4}
                                className="w-full p-3 rounded-xl border border-[#e8e2d8] focus:border-[#c8622a] focus:ring-1 focus:ring-[#c8622a] outline-none"
                            />
                        </div>
                        <div className="flex gap-3 justify-end mt-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 rounded-xl border border-[#e8e2d8] text-[#8a8780] hover:bg-[#f0ebe1] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateProfile.isPending}
                                className="px-6 py-2 rounded-xl bg-[#1a1a18] text-white hover:bg-[#c8622a] transition-colors disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-[#8a8780] mb-2">Bio</h3>
                            <p className="text-[#1a1a18] bg-[#faf8f4] p-4 rounded-xl border border-[#e8e2d8] min-h-[100px] whitespace-pre-wrap">
                                {user?.bio || "No bio added yet."}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full py-3 rounded-xl border border-[#e8e2d8] text-[#1a1a18] font-medium hover:bg-[#f0ebe1] transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
