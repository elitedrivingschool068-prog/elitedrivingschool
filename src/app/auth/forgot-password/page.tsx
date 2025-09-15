'use client'

import { useState } from 'react'
import { resetPasswordForEmail } from '@/lib/actions/auth'
import styles from './forgotPassword.module.css'
import SubmitButton from '@/components/SubmitButton'
import { FaEnvelope, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa'

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setStatus('idle')
    setMessage(null)
    const result = await resetPasswordForEmail(formData)
    
    if (result.success) {
      setStatus('success')
      setMessage('A password reset link has been sent to your email.')
    } else {
      setStatus('error')
      setMessage(result.error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Forgot Password?</h2>
        <p className={styles.subtitle}>
          Enter your email and we&apos;ll send you a password reset link.
        </p>
        <form action={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaEnvelope />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="Email address"
            />
          </div>
          <SubmitButton>Send Reset Link</SubmitButton>
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