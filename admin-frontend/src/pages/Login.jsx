import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Login({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/admin/login', {
        username: email,
        password: password
      });
      
      // Store both access token and refresh token
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('refreshToken', res.data.refresh_token);
      
      if (onAuthSuccess) onAuthSuccess();
      toast.success('Successfully logged in as admin');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="max-w-sm w-full bg-[#141414] border border-[#1f1f1f] rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Admin Login</h1>
        <p className="text-[#8a8780] text-sm text-center mb-8">Sign in to manage the platform</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8a8780] mb-1">Admin Email</label>
            <input 
              type="email" 
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8622a] transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8a8780] mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8622a] transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-[#c8622a] text-white rounded-xl py-3 font-semibold hover:bg-[#a65020] transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}
