'use client'

import { useState } from 'react'
import { FaEnvelope, FaLock, FaSignInAlt, FaExclamationCircle, FaUserShield, FaArrowLeft } from 'react-icons/fa'
import { adminSignIn } from '@/lib/actions/auth'
import styles from './AuthForm.module.css'
import SubmitButton from './SubmitButton'
import Link from 'next/link'

const AdminAuthForm = () => {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const result = await adminSignIn(formData)

    if (result && !result.success) {
      setError(result.error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <FaUserShield style={{ fontSize: '2rem', color: '#10b981', marginRight: '0.5rem' }} />
          <h2 className={styles.title} style={{ margin: 0, color: '#10b981' }}>
            Admin Access
          </h2>
        </div>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Sign in with your admin credentials to access the admin dashboard
        </p>
        
        {error && (
          <div className={`${styles.statusMessage} ${styles.error}`}>
            <FaExclamationCircle className={styles.statusIcon} />
            <span>{error}</span>
          </div>
        )}
        
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
              placeholder="Admin email address"
            />
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaLock />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              placeholder="Password"
            />
          </div>
          
          <div>
            <SubmitButton>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaSignInAlt style={{ marginRight: '8px' }} /> 
                Access Admin Dashboard
              </span>
            </SubmitButton>
          </div>
        </form>
        
        <div className={styles.linkGroup} style={{ marginTop: '2rem' }}>
          <Link href="/" className={styles.linkButton} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <FaArrowLeft style={{ marginRight: '8px' }} />
            Back to Home
          </Link>
        </div>
        
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '0.375rem', 
          fontSize: '0.875rem',
          color: '#0369a1'
        }}>
          <strong>Note:</strong> If you sign in with regular user credentials, you will be redirected to the user dashboard instead.
        </div>
      </div>
    </div>
  )
}

export default AdminAuthForm