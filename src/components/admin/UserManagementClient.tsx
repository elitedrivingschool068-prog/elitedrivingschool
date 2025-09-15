'use client'

import { updateUserRole, deleteUser } from '@/lib/actions/admin'
import { useTransition } from 'react'
import styles from '@/app/admin/admin.module.css'

type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  bookings?: Array<{ count: number }>
}

type UserManagementClientProps = {
  users: User[]
}

export default function UserManagementClient({ users }: UserManagementClientProps) {
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('role', newRole)
      await updateUserRole(formData)
    })
  }

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append('userId', userId)
      await deleteUser(formData)
    })
  }

  return (
    <div className={styles.table}>
      <table className={styles.tableElement}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Bookings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                {user.first_name || 'N/A'} {user.last_name || ''}
              </td>
              <td>{user.email || 'No email'}</td>
              <td>
                <span className={`${styles.badge} ${styles[user.role]}`}>
                  {user.role}
                </span>
              </td>
              <td>{user.bookings?.[0]?.count || 0}</td>
              <td>
                <div className={styles.actionGroup}>
                  <select 
                    name="role" 
                    defaultValue={user.role}
                    className={styles.roleSelect}
                    disabled={isPending}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  <button 
                    type="button" 
                    className={`${styles.actionButton} ${styles.danger}`}
                    disabled={isPending}
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}