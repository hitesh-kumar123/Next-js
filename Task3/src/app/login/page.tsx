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
    <main className="min-h-screen w-full bg-[#FBF7F0] flex">
      <style>{`
        @keyframes auric-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auric-rise { animation: auric-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .auric-rise { animation: none; }
        }
      `}</style>

      {/* Left — brand panel, hidden on small screens */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 bg-[#1B2432] text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
            alt="Gym member preparing to lift a barbell on the training floor"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B2432] via-[#1B2432]/85 to-[#1B2432]/40" />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2.5 w-fit">
          <span className="material-symbols-outlined text-[#F5A623] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
            fitness_center
          </span>
          <span className="text-2xl font-black tracking-tighter">
            AURIC<span className="text-[#F5A623] font-light">FIT</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-8">
          <blockquote className="space-y-4">
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[#F5A623] text-base">star</span>
              ))}
            </div>
            <p className="text-2xl font-bold leading-snug tracking-tight">
              &ldquo;Check-ins used to be a clipboard. Now it&apos;s a five-second QR scan.&rdquo;
            </p>
            <footer className="text-sm text-slate-300">
              Priya Nair &middot; Ironwell Fitness
            </footer>
          </blockquote>

          <div className="flex gap-8 pt-6 border-t border-white/10">
            <div>
              <p className="text-2xl font-black">400+</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">Gyms onboard</p>
            </div>
            <div>
              <p className="text-2xl font-black">18%</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">Avg. weekly growth</p>
            </div>
            <div>
              <p className="text-2xl font-black">24/7</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative">
        <div className="orb-glow top-[-120px] right-[-120px] md:w-[500px] md:h-[500px] lg:hidden" aria-hidden="true" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile-only logo */}
          <Link href="/" className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <span className="material-symbols-outlined text-[#F5A623] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
              fitness_center
            </span>
            <span className="text-2xl font-black tracking-tighter text-[#1B2432]">
              AURIC<span className="text-[#F5A623] font-light">FIT</span>
            </span>
          </Link>

          <div className="auric-rise">
            <h1 className="text-3xl font-black tracking-tight text-[#1B2432]">Welcome back</h1>
            <p className="text-sm text-[#6B6459] mt-2">
              Log in to manage your members, billing, and check-ins.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="auric-rise mt-6 p-3.5 bg-[#FCEBEB] border border-[#E24B4A]/25 rounded-xl text-xs text-[#791F1F] flex items-start gap-2.5"
            >
              <span className="material-symbols-outlined text-base leading-none mt-0.5" aria-hidden="true">error</span>
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5 auric-rise" style={{ animationDelay: '80ms' }}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6459]/50 text-lg" aria-hidden="true">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#1B2432]/12 focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/12 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all placeholder:text-[#6B6459]/40 text-[#1B2432]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#1B2432]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#B5791A] hover:text-[#F5A623] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6459]/50 text-lg" aria-hidden="true">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#1B2432]/12 focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/12 rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none transition-all placeholder:text-[#6B6459]/40 text-[#1B2432]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6459]/50 hover:text-[#F5A623] transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 active:scale-[0.98] text-[#1B2432] py-3.5 rounded-full font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <span className="animate-spin border-2 border-[#1B2432]/30 border-t-[#1B2432] rounded-full w-4 h-4" aria-hidden="true" />
                  Logging in&hellip;
                </>
              ) : (
                <>
                  Log in
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm border-t border-[#1B2432]/8 pt-6 auric-rise" style={{ animationDelay: '140ms' }}>
            <span className="text-[#6B6459]">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-[#1B2432] font-bold hover:text-[#F5A623] transition-colors">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}