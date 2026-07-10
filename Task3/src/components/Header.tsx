'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const navLinks = [
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#pricing', label: 'Plans' },
  { href: '#testimonials', label: 'Stories' },
  { href: '#faq', label: 'FAQ' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    // sticky (not fixed) — this reserves its own height in normal document
    // flow, so content below it is never guessed-padding-dependent and can
    // never end up hidden underneath it.
    <header
      className={`sticky top-0 z-30 w-full border-b transition-all duration-300 bg-[#FBF7F0] ${
        scrolled ? 'border-[#1B2432]/10 shadow-sm' : 'border-[#1B2432]/0'
      }`}
    >
      <div
        className="relative max-w-7xl mx-auto px-6 h-20 flex justify-between items-center"
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
              window.history.pushState(null, '', '/')
            }
          }}
          className="group flex items-center gap-2.5 z-10"
        >
          <span
            className="material-symbols-outlined text-[#F5A623] text-3xl transition-transform duration-500 ease-out group-hover:rotate-[25deg] group-hover:scale-110"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            fitness_center
          </span>
          <span className="text-2xl font-black tracking-tighter">
            AURIC<span className="text-[#F5A623] font-light">FIT</span>
          </span>
        </Link>

        {/* Single nav — row on desktop, dropdown panel on mobile.
            The mobile dropdown is `absolute`, so it overlays content
            instead of pushing the sticky header's own height around. */}
        <nav
          aria-label="Primary"
          className={`
            flex flex-col gap-1 text-sm font-bold text-[#1B2432] uppercase tracking-widest
            absolute left-0 top-full w-full bg-[#FBF7F0] border-t border-[#1B2432]/8 px-6 overflow-hidden
            transition-all duration-300 ease-out
            ${menuOpen ? 'max-h-80 opacity-100 py-4 shadow-lg' : 'max-h-0 opacity-0 py-0'}

            md:static md:flex-row md:items-center md:w-auto md:max-h-none md:opacity-100
            md:border-0 md:bg-transparent md:px-0 md:py-0 md:gap-8 md:shadow-none
            md:text-xs md:text-[#6B6459] md:tracking-widest md:overflow-visible
          `}
        >
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: menuOpen ? `${i * 40}ms` : '0ms' }}
              className={`
                group relative py-2.5 md:py-1 border-b border-[#1B2432]/5 md:border-0 last:border-0
                transition-all duration-300 hover:text-[#F5A623] md:hover:text-[#1B2432]
                ${menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                md:opacity-100 md:translate-x-0
              `}
            >
              {link.label}
              <span className="hidden md:block absolute left-0 -bottom-0.5 h-[2px] w-0 bg-[#F5A623] transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}

          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="py-2.5 md:hidden text-[#6B6459] hover:text-[#F5A623] transition-colors"
          >
            Log In
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4 z-10">
          <Link
            href="/login"
            className="hidden md:inline-block text-xs font-bold text-[#1B2432] hover:text-[#F5A623] uppercase tracking-wider px-3 sm:px-4 py-2 transition-colors"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="relative overflow-hidden bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] text-[#1B2432] font-extrabold px-4 sm:px-6 py-2.5 rounded-full text-xs shadow-md transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
          >
            <span className="hidden sm:inline relative z-10">Create Gym Owner Account</span>
            <span className="sm:hidden relative z-10">Sign Up</span>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 transition-transform duration-700 ease-out hover:translate-x-full" />
          </Link>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="md:hidden relative w-9 h-9 flex flex-col justify-center items-center gap-1.5"
          >
            <span className={`block h-[2px] w-6 bg-[#1B2432] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-[2px] w-6 bg-[#1B2432] transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block h-[2px] w-6 bg-[#1B2432] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  )
}