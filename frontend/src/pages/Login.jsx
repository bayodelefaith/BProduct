import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = new URLSearchParams()
      data.append("username", form.username)
      data.append("password", form.password)
      const res = await api.post("/login", data)
      login(res.data.access_token)
      navigate("/products")
    } catch {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-up">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back</h1>
          <p className="text-[#8a8780]">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1a1a18]">Email</label>
            <input
              className="w-full border border-[#e8e2d8] bg-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c8622a] focus:ring-2 focus:ring-[#c8622a]/10 transition"
              placeholder="you@example.com"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1a1a18]">Password</label>
            <input
              type="password"
              className="w-full border border-[#e8e2d8] bg-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c8622a] focus:ring-2 focus:ring-[#c8622a]/10 transition"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-[#1a1a18] text-[#faf8f4] py-3 rounded-xl text-sm font-medium hover:bg-[#c8622a] transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-[#8a8780]">
          No account?{" "}
          <Link to="/register" className="text-[#c8622a] font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}