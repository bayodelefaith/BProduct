import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const { isAuth, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => { logout(); navigate("/login") }

  const linkClass = (path) =>
    `text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${pathname === path
      ? "border-[#c8622a] text-[#c8622a]"
      : "border-transparent text-[#1a1a18] hover:text-[#c8622a]"
    }`

  return (
    <nav className="sticky top-0 z-50 bg-[#faf8f4]/90 backdrop-blur border-b border-[#e8e2d8]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link to="/products" className="font-['Playfair_Display'] text-xl font-bold tracking-tight">
          Bmarket
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/products" className={linkClass("/products")}>Shop</Link>
          <Link to="/posts" className={linkClass("/posts")}>Feed</Link>
          {isAuth && <Link to="/my-posts" className={linkClass("/my-posts")}>My Posts</Link>}
          {isAuth && <Link to="/cart" className={linkClass("/cart")}>Cart</Link>}
          {isAuth && <Link to="/orders" className={linkClass("/orders")}>Orders</Link>}
          {isAdmin === true && (
            <>
              <Link to="/admin/products" className={linkClass("/admin/products")}>Admin Products</Link>
              <Link to="/admin/orders" className={linkClass("/admin/orders")}>Admin Orders</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuth ? (
            <>
              <Link to="/profile" className="text-sm font-medium text-[#8a8780] hover:text-[#1a1a18] transition-colors mr-3">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-[#8a8780] hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-[#8a8780] hover:text-[#1a1a18] transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-[#1a1a18] text-[#faf8f4] px-4 py-2 rounded-full hover:bg-[#c8622a] transition-colors duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}