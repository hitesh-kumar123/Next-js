import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let path = request.nextUrl.pathname
  const hostHeader = request.headers.get('host') || ''
  let host = hostHeader.split(':')[0].toLowerCase().trim()
  
  // Safety check for environment variables in production
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Middleware Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!")
    return new NextResponse(
      JSON.stringify({
        error: "Missing Supabase Environment Variables",
        message: "Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel Project Settings > Environment Variables, then redeploy."
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  path = request.nextUrl.pathname
  const isAsset = path.startsWith('/_next') ||
                  path.startsWith('/static') ||
                  path.includes('.')

  if (isAsset) {
    return supabaseResponse
  }

  // Parse Subdomain
  // host is already normalized and port-stripped at the top
  const isIpAddress = /^[0-9.]+$/.test(host.split(':')[0])
  const parts = host.split('.')
  let subdomain: string | null = null

  if (!isIpAddress && parts.length > 1) {
    if (host.includes('localhost')) {
      // Local dev e.g. goldgym.localhost:3000 (parts.length === 2)
      if (parts.length === 2) {
        const possible = parts[0].toLowerCase()
        if (possible !== 'www') subdomain = possible
      }
    } else if (host.endsWith('.vercel.app')) {
      // Vercel deployment URL e.g. goldgym.myproject.vercel.app (parts.length === 4)
      if (parts.length === 4) {
        const possible = parts[0].toLowerCase()
        if (possible !== 'www' && possible !== 'api') subdomain = possible
      }
    } else {
      // Custom production domain e.g. goldgym.thinkauric.com (parts.length === 3)
      if (parts.length === 3) {
        const possible = parts[0].toLowerCase()
        if (possible !== 'www' && possible !== 'api') subdomain = possible
      }
    }
  }

  console.log("Middleware Routing - Host:", host, "Path:", path, "Subdomain:", subdomain)

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
