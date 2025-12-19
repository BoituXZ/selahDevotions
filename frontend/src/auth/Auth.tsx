import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Try to sign in
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    // If error, maybe they need to sign up?
    if (error) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) alert(signUpError.message)
        else alert('Account created! You are logged in.')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-stone-50">
      <div className="p-8 bg-white shadow-xl rounded-xl border border-stone-200">
        <h1 className="text-2xl font-serif text-stone-800 mb-6">Selah Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-64">
          <input
            className="p-2 border rounded"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="p-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            disabled={loading}
            className="bg-stone-800 text-white p-2 rounded hover:bg-stone-700 transition"
          >
            {loading ? 'Loading...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
