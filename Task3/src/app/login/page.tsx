'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        router.refresh()
        router.push('/dashboard')
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err)
      if (errMsg.toLowerCase().includes('fetch') || errMsg.toLowerCase().includes('failed to fetch')) {
        setErrorMsg('Failed to connect to Supabase. Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set in the .env file.')
      } else {
        setErrorMsg(errMsg || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px] md:w-[600px] md:h-[600px]" />
      <div className="orb-glow bottom-[-150px] left-[-150px] md:w-[600px] md:h-[600px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-4xl leading-none">
              fitness_center
            </span>
            <span className="font-display text-3xl font-extrabold text-[#1B2432] tracking-tight">
              AURIC
            </span>
          </div>
          <p className="text-on-surface-variant text-sm font-sans">
            Gym & Fitness Studio Management SaaS
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <h2 className="font-display text-2xl font-bold text-[#1B2432] mb-1">
            Welcome Back
          </h2>
          <p className="text-on-surface-variant text-sm mb-6">
            Log in to manage your workouts and memberships.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-error">
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-[#857462]/60 text-[#201b13]"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">
                  mail
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-[#857462]/60 pr-12 text-[#201b13]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 active:scale-[0.98] text-white py-3.5 rounded-full font-semibold transition-all shadow-md glow-shadow-gold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <span className="material-symbols-outlined text-lg">
                      login
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm border-t border-[#d7c3ae]/20 pt-6">
            <span className="text-on-surface-variant">Don't have an account? </span>
            <Link
              href="/signup"
              className="text-[#835500] font-semibold hover:text-[#F5A623] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
