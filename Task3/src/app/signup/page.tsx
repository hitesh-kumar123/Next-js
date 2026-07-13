'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const ONBOARDING_STEPS = [
  { n: '01', title: 'Create your account', desc: 'Set up billing and your gym profile in minutes.' },
  { n: '02', title: 'Build your signup page', desc: 'Add products, pricing, and your waiver.' },
  { n: '03', title: 'Start checking members in', desc: 'Camera QR scans replace the clipboard.' },
]

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const passwordStrength = useMemo(() => {
    if (!password) return { label: '', level: 0 }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { label: 'Weak', level: 1 }
    if (score <= 2) return { label: 'Okay', level: 2 }
    if (score === 3) return { label: 'Good', level: 3 }
    return { label: 'Strong', level: 4 }
  }, [password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        // In Supabase, if email confirmation is disabled, user is immediately logged in
        // and data.session is populated.
        if (data.session) {
          router.refresh()
          router.push('/dashboard')
        } else {
          setSuccessMsg(
            'Registration successful! Please check your email inbox to confirm your account.'
          )
          // Reset form fields
          setFullName('')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
        }
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

  const strengthColor =
    passwordStrength.level <= 1
      ? '#E24B4A'
      : passwordStrength.level === 2
      ? '#F5A623'
      : passwordStrength.level === 3
      ? '#8FA24D'
      : '#3B6D11'

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
            src="https://images.unsplash.com/photo-1689877020200-403d8542d95d?auto=format&fit=crop&w=1200&q=80"
            alt="Gym floor lined with strength training machines and free weights"
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

        <div className="relative z-10 space-y-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]">Free to start</span>
            <p className="text-2xl font-bold leading-snug tracking-tight mt-2">
              Run your gym without the spreadsheets.
            </p>
          </div>

          <ol className="space-y-6">
            {ONBOARDING_STEPS.map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="shrink-0 w-9 h-9 rounded-full border-2 border-[#F5A623] text-[#F5A623] font-black text-xs flex items-center justify-center">
                  {step.n}
                </span>
                <div>
                  <p className="font-bold text-sm">{step.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex gap-8 pt-6 border-t border-white/10">
            <div>
              <p className="text-2xl font-black">400+</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">Gyms onboard</p>
            </div>
            <div>
              <p className="text-2xl font-black">$0</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">Setup fee</p>
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
            <h1 className="text-3xl font-black tracking-tight text-[#1B2432]">Create your account</h1>
            <p className="text-sm text-[#6B6459] mt-2">
              Get started with Auric to manage your fitness business.
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

          {successMsg && (
            <div
              role="status"
              className="auric-rise mt-6 p-3.5 bg-[#EAF3DE] border border-[#639922]/25 rounded-xl text-xs text-[#27500A] flex items-start gap-2.5"
            >
              <span className="material-symbols-outlined text-base leading-none mt-0.5" aria-hidden="true">check_circle</span>
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="mt-8 space-y-5 auric-rise" style={{ animationDelay: '80ms' }}>
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5">
                Full name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6459]/50 text-lg" aria-hidden="true">
                  person
                </span>
                <input
                  id="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jordan Lee"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-[#1B2432]/12 focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/12 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all placeholder:text-[#6B6459]/40 text-[#1B2432]"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6459]/50 text-lg" aria-hidden="true">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#1B2432]/12 focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/12 rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none transition-all placeholder:text-[#6B6459]/40 text-[#1B2432]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6459]/50 hover:text-[#F5A623] transition-colors p-1 z-10 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 rounded-full bg-[#1B2432]/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${passwordStrength.level * 25}%`, backgroundColor: strengthColor }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: strengthColor }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6459]/50 text-lg" aria-hidden="true">
                  lock_reset
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-[#1B2432]/12 focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/12 rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none transition-all placeholder:text-[#6B6459]/40 text-[#1B2432]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6459]/50 hover:text-[#F5A623] transition-colors p-1 z-10 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
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
                  Creating account&hellip;
                </>
              ) : (
                <>
                  Create account
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm border-t border-[#1B2432]/8 pt-6 auric-rise" style={{ animationDelay: '140ms' }}>
            <span className="text-[#6B6459]">Already have an account? </span>
            <Link href="/login" className="text-[#1B2432] font-bold hover:text-[#F5A623] transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}