'use client'

import { useState } from 'react'
import { FaUser, FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { completeProfile } from '@/lib/actions/profile'
import styles from './ProfileForm.module.css'
import SubmitButton from './SubmitButton'

const EditProfileForm = ({ initialFirstName, initialLastName }: { initialFirstName: string, initialLastName: string }) => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setStatus('idle')
    setMessage(null)

    const result = await completeProfile(formData)

    if (result.success) {
      setStatus('success')
      setMessage('Profile updated successfully!')
    } else {
      setStatus('error')
      setMessage(result.error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Edit Your Profile</h2>
        <p className={styles.subtitle}>Update your first and last name below.</p>
        <form action={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaUser />
            </div>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              defaultValue={initialFirstName}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaUser />
            </div>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              defaultValue={initialLastName}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.divider}></div>
          <h3 className={styles.sectionTitle}>Change Password</h3>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaLock />
            </div>
            <input
              type="password"
              name="password"
              placeholder="New Password"
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaLock />
            </div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              className={styles.input}
            />
          </div>
          <SubmitButton>Save Changes</SubmitButton>
        </form>
        {status === 'success' && (
          <div className={`${styles.statusMessage} ${styles.success}`}>
            <FaCheckCircle className={styles.statusIcon} />
            <span>{message}</span>
          </div>
        )}
        {status === 'error' && (
          <div className={`${styles.statusMessage} ${styles.error}`}>
            <FaExclamationCircle className={styles.statusIcon} />
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditProfileForm