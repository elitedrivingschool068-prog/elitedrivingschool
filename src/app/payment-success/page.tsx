import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './payment-success.module.css'

export default async function PaymentSuccessPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth/sign-in')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.successIcon}>✅</div>
        <h1 className={styles.title}>Payment Successful!</h1>
        <p className={styles.message}>
          Your lesson booking has been confirmed and payment has been processed successfully.
        </p>
        <p className={styles.subMessage}>
          You will receive a confirmation email shortly with your lesson details.
        </p>
        <div className={styles.actions}>
          <Link href="/bookings" className={styles.primaryButton}>
            View My Bookings
          </Link>
          <Link href="/instructors" className={styles.secondaryButton}>
            Book Another Lesson
          </Link>
        </div>
      </div>
    </div>
  )
}