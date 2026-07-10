import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid calling getUser() on endpoints that are static or assets
  const path = request.nextUrl.pathname
  const isAsset = path.startsWith('/_next') ||
                  path.startsWith('/static') ||
                  path.includes('.')

  if (isAsset) {
    return supabaseResponse
  }

  // Parse Subdomain
  const host = request.headers.get('host') || ''
  const parts = host.split('.')
  let subdomain: string | null = null

  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1]
    if (lastPart.startsWith('localhost:3000') && parts.length === 2) {
      const possible = parts[0].toLowerCase()
      if (possible !== 'www') subdomain = possible
    } else if (parts.length > 2) {
      const possible = parts[0].toLowerCase()
      if (possible !== 'www' && possible !== 'api') subdomain = possible
    }
  }

  // If subdomain is active, rewrite path internally to /subdomains/[subdomain]/...
  if (subdomain) {
    const rewriteUrl = new URL(`/subdomains/${subdomain}${path}`, request.url)
    return NextResponse.rewrite(rewriteUrl)
  }

  // Refresh session if expired (only for main domain)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (path.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect to dashboard if logged in and trying to access auth pages
  if (user && (path.startsWith('/login') || path.startsWith('/signup') || path === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

