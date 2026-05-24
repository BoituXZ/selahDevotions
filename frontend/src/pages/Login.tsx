import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../auth/supabase'
import { toast } from 'sonner'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
        toast.error("Oops, that didn't work.")
    } else {
        navigate('/') 
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-stone-50">
      <div className="p-8 bg-white shadow-xl rounded-xl border border-stone-200 w-full max-w-sm">
        <h1 className="text-3xl font-serif text-stone-800 mb-2">Selah.</h1>
        <p className="text-stone-500 mb-6 text-sm">Welcome back to your sanctuary.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className="p-3 border border-stone-300 rounded focus:ring-2 focus:ring-stone-500 outline-none transition"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="p-3 border border-stone-300 rounded focus:ring-2 focus:ring-stone-500 outline-none transition"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            disabled={loading}
            className="bg-stone-800 text-white p-3 rounded font-medium hover:bg-stone-700 transition disabled:opacity-50 mt-2"
          >
            {loading ? '...' : 'Enter Sanctuary'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-stone-900 font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}