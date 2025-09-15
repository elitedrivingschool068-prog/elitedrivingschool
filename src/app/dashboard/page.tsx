// src/app/dashboard/page.tsx

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import UpcomingLessons from '@/components/UpcomingLessons'
import Link from 'next/link'
import styles from './dashboard.module.css'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    return redirect('/auth/sign-in')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth/sign-in')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', user.id)
    .single()
  
  const firstName = profile?.first_name

  if (!firstName) {
    return <ProfileForm />
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.dashboardContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome, {firstName}!</h1>
        </div>
        
        {/* Bookings section to show user's lessons */}
        <div className={styles.bookingSection}>
          <UpcomingLessons />
        </div>
        
        {/* Replace the BookingForm with a button to start the new flow */}
        <div className={styles.bookingSection}>
          <h2 className={styles.sectionTitle}>Ready to book a lesson?</h2>
          <div className={styles.actionButtons}>
            <Link href="/instructors" className={styles.ctaButton}>
              Browse Instructors
            </Link>
            <Link href="/bookings" className={styles.secondaryButton}>
              View All Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}