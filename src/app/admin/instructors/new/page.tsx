import { requireAdmin } from '@/lib/admin'
import AdminNav from '@/components/AdminNav'
import { InstructorForm } from './InstructorForm'
import styles from '../../admin.module.css'

export default async function NewInstructor() {
  await requireAdmin()

  return (
    <div className={styles.adminLayout}>
      <AdminNav />
      <main className={styles.adminMain}>
        <div className={styles.adminContent}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Add New Instructor</h1>
              <p className={styles.subtitle}>Create a new driving instructor account</p>
            </div>
          </div>

          <InstructorForm />

          <div className={styles.note}>
            <p><strong>Note:</strong> The instructor will be created with a temporary password &quot;temppassword123&quot;. They should change this password when they first log in.</p>
          </div>
        </div>
      </main>
    </div>
  )
}