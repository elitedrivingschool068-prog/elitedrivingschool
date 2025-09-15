import { requireAdmin } from '@/lib/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import AdminNav from '@/components/AdminNav'
import UserManagementClient from '@/components/admin/UserManagementClient'
import styles from '../admin.module.css'

export default async function UsersManagement() {
  await requireAdmin()
  
  const supabase = await createServerSupabaseClient()

  // Fetch all users with their booking counts
  const { data: usersData, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      first_name,
      last_name,
      role,
      bookings:bookings(count)
    `)
    .order('first_name', { ascending: true });

  if (error) {
    console.error('Error fetching users:', error);
  }

  const users = usersData?.map(user => ({
    ...user,
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || ''
  })) || [];

  return (
    <div className={styles.adminLayout}>
      <AdminNav />
      <main className={styles.adminMain}>
        <div className={styles.adminContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>User Management</h1>
            <p className={styles.subtitle}>Manage user accounts and roles</p>
          </div>

          <div className={styles.card}>
            {users && users.length > 0 ? (
              <UserManagementClient users={users} />
            ) : (
              <p className={styles.emptyState}>No users found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}