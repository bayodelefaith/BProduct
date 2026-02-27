import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import AdminProducts from "./pages/admin/AdminProducts"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"
import MyPosts from "./pages/MyPosts"
import AllPosts from "./pages/AllPosts"
import PostDetail from "./pages/PostDetail"
import Orders from "./pages/Orders"
import Profile from "./pages/Profile"
import AdminOrders from "./pages/admin/AdminOrders"
import "./index.css"

function PrivateRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/products" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/posts" element={<AllPosts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin/products" element={<PrivateRoute><AdminProducts /></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute><AdminOrders /></PrivateRoute>} />
          <Route path="/my-posts" element={<PrivateRoute><MyPosts /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  )
}