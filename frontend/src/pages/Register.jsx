import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api/axios"

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.post("/register", form)
      navigate("/login")
    } catch {
      setError("Registration failed. Email may already be in use.")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
    { key: "email", label: "Email", type: "text", placeholder: "you@example.com" },
    { key: "password", label: "Password", type: "password", placeholder: "••••••••" },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-up">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create account</h1>
          <p className="text-[#8a8780]">Join our marketplace today</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1a1a18]">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                className="w-full border border-[#e8e2d8] bg-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c8622a] focus:ring-2 focus:ring-[#c8622a]/10 transition"
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-[#1a1a18] text-[#faf8f4] py-3 rounded-xl text-sm font-medium hover:bg-[#c8622a] transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-[#8a8780]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#c8622a] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}