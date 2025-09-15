import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditProfileForm from '@/components/EditProfileForm'
import styles from '../dashboard.module.css'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth/sign-in')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()
  
  if (!profile) {
    return redirect('/dashboard')
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.dashboardContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Profile Settings</h1>
        </div>
        <EditProfileForm 
          initialFirstName={profile.first_name || ''} 
          initialLastName={profile.last_name || ''} 
        />
      </div>
    </div>
  )
}