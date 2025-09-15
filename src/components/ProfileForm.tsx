'use client'

import { useState } from 'react'
import { FaUser, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { completeProfile } from '@/lib/actions/profile'
import styles from './ProfileForm.module.css'
import SubmitButton from './SubmitButton'

const ProfileForm = () => {
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
        <h2 className={styles.title}>Complete Your Profile</h2>
        <p className={styles.subtitle}>Please provide your first and last name to get started.</p>
        <form action={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaUser />
            </div>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
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
              required
              className={styles.input}
            />
          </div>
          <SubmitButton>Save Profile</SubmitButton>
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

export default ProfileForm