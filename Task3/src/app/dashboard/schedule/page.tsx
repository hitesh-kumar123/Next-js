import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ScheduleClient from './ScheduleClient'

export const dynamic = 'force-dynamic'

export default async function ClassSchedulePage() {
  const supabase = await createClient()

  // Get session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile to verify role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Fetch classes along with the bookings count using Supabase counts join
  // Note: in Supabase JS, to count children without retrieving them, use:
  // .select('*, class_bookings(count)')
  const { data: classesData, error: classesErr } = await supabase
    .from('classes')
    .select('*, class_bookings(count)')
    .order('start_time', { ascending: true })

  if (classesErr) {
    console.error('Failed to pull classes:', classesErr)
  }

  // Format classes to extract bookings_count
  const classes = (classesData || []).map((c: any) => {
    // class_bookings count can be array of count or object depending on postgrest version
    let count = 0
    if (c.class_bookings) {
      if (Array.isArray(c.class_bookings)) {
        count = c.class_bookings[0]?.count || 0
      } else if (typeof c.class_bookings === 'object') {
        count = (c.class_bookings as any).count || 0
      }
    }
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      instructor: c.instructor,
      location: c.location,
      category: c.category,
      start_time: c.start_time,
      duration_minutes: c.duration_minutes,
      capacity: c.capacity,
      bookings_count: count,
    }
  })

  // Fetch the logged-in user's active bookings
  const { data: bookingsData } = await supabase
    .from('class_bookings')
    .select('class_id')
    .eq('user_id', user.id)

  const bookedIds = (bookingsData || []).map((b) => b.class_id)

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#835500]">
            Class Scheduling & Calendar
          </h1>
          <p className="text-[#524534] text-sm mt-1">
            Browse upcoming studio sessions, filter by Category, and book your spots.
          </p>
        </div>
      </header>

      <ScheduleClient
        initialClasses={classes}
        initialBookedIds={bookedIds}
        userRole={profile.role}
      />
    </main>
  )
}
