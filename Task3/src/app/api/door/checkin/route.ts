import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Simple API Key security for Gym Door integration
const API_KEY = process.env.DOOR_API_KEY || 'auric-door-api-secret-key-2026'

export async function POST(req: NextRequest) {
  try {
    // 1. Verify API Key
    const reqApiKey = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('api_key')
    if (reqApiKey !== API_KEY) {
      return NextResponse.json(
        { allowed: false, error: 'Unauthorized. Invalid or missing x-api-key header.' },
        { status: 401 }
      )
    }

    // 2. Read Request Parameters
    const body = await req.json().catch(() => ({}))
    const identifier = body.identifier?.trim() || req.nextUrl.searchParams.get('identifier')?.trim()

    if (!identifier) {
      return NextResponse.json(
        { allowed: false, error: 'Missing member identifier. Provide "identifier" in JSON body or search query.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 3. Find Member
    const cleanId = identifier.toLowerCase()
    let member = null

    // Search by UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(cleanId)) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', cleanId)
        .eq('role', 'Member')
        .maybeSingle()
      if (data) member = data
    }

    // Search by Member ID format (AUR-XXXX-XXXX)
    if (!member && cleanId.startsWith('aur-')) {
      const parts = cleanId.replace('aur-', '').split('-')
      if (parts.length === 2) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'Member')
          .filter('id', 'like', `${parts[0]}%`)
          .filter('id', 'like', `%${parts[1]}`)
          .limit(1)
          .maybeSingle()
        if (data) member = data
      }
    }

    // Search by Email
    if (!member) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanId)
        .eq('role', 'Member')
        .maybeSingle()
      if (data) member = data
    }

    // Search by Authorize.net Customer ID
    if (!member) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('authorize_net_customer_id', identifier)
        .eq('role', 'Member')
        .maybeSingle()
      if (data) member = data
    }

    // Search by Name
    if (!member) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'Member')
        .ilike('full_name', cleanId)
        .limit(1)
        .maybeSingle()
      if (data) member = data
    }

    if (!member) {
      return NextResponse.json({
        allowed: false,
        reason: 'Blocked: Member profile could not be found.',
      })
    }

    const memberName = member.full_name || 'Member'

    // 4. Waiver Verification
    const { data: waiverSign } = await supabase
      .from('waiver_agreements')
      .select('id')
      .eq('user_id', member.id)
      .limit(1)
      .maybeSingle()

    if (!waiverSign) {
      return NextResponse.json({
        allowed: false,
        reason: 'Blocked: Waiver Not Signed.',
        memberName,
      })
    }

    // 5. Membership Status Verification
    const { data: membership } = await supabase
      .from('member_products')
      .select('id, products(name)')
      .eq('user_id', member.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({
        allowed: false,
        reason: 'Blocked: Membership Inactive.',
        memberName,
      })
    }

    const activePlan = (membership.products as any)?.name || 'Active Membership'

    // 6. Log check-in via Door API
    const { error: logErr } = await supabase.from('checkins').insert({
      user_id: member.id,
      checked_in_by: null, // Null indicates door API automatic checkin
    })

    if (logErr) {
      return NextResponse.json({
        allowed: false,
        reason: 'Database log error: ' + logErr.message,
        memberName,
      })
    }

    return NextResponse.json({
      allowed: true,
      memberName,
      activePlan,
      message: 'Access Granted! Enjoy your workout.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { allowed: false, error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
