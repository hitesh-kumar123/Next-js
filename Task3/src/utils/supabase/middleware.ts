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

  const path = request.nextUrl.pathname
  const isAsset = path.startsWith('/_next') ||
                  path.startsWith('/static') ||
                  path.includes('.')

  if (isAsset) {
    return supabaseResponse
  }

  // Parse Subdomain
  const host = request.headers.get('host') || ''
  const isIpAddress = /^[0-9.]+$/.test(host.split(':')[0])
  const parts = host.split('.')
  let subdomain: string | null = null

  if (!isIpAddress && parts.length > 1) {
    const lastPart = parts[parts.length - 1]
    if (lastPart.startsWith('localhost:3000') && parts.length === 2) {
      const possible = parts[0].toLowerCase()
      if (possible !== 'www') subdomain = possible
    } else if (parts.length > 2) {
      const possible = parts[0].toLowerCase()
      if (possible !== 'www' && possible !== 'api') subdomain = possible
    }
  }

  // If subdomain is active, verify owner status
  if (subdomain) {
    // Check if the owner of this subdomain is suspended
    const { data: gymOwner } = await supabase
      .from('users')
      .select('is_suspended')
      .eq('subdomain', subdomain.toLowerCase())
      .maybeSingle()

    if (gymOwner && gymOwner.is_suspended) {
      // Rewrite to public suspension message
      const suspendedUrl = new URL('/suspended', request.url)
      return NextResponse.rewrite(suspendedUrl)
    }

    const rewriteUrl = new URL(`/subdomains/${subdomain}${path}`, request.url)
    return NextResponse.rewrite(rewriteUrl)
  }

  // Refresh session if expired (only for main domain)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Check if user account is suspended
    const { data: profile } = await supabase
      .from('users')
      .select('is_suspended')
      .eq('id', user.id)
      .maybeSingle()

    if (profile && profile.is_suspended) {
      // Clear cookies and force redirect to login with error parameter
      const response = NextResponse.redirect(new URL('/login?error=account_suspended', request.url))
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      return response
    }
  }

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
