'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { FaLock, FaExclamationCircle, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa'
import SubmitButton from '@/components/SubmitButton'
import styles from './updatePassword.module.css'

const UpdatePasswordClient = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseBrowserClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [isValidSession, setIsValidSession] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      // Check if we have a valid session from the password reset link
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session) {
        setIsValidSession(true)
      } else {
        // Try to get session from URL parameters (for email confirmation)
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const code = searchParams.get('code')
        
        if (code) {
          // Handle the code from email link
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (data.session) {
            setIsValidSession(true)
          } else {
            console.error('Failed to exchange code for session:', exchangeError)
            setStatus('error')
            setMessage('Invalid or expired password reset link. Please request a new one.')
          }
        } else if (accessToken && refreshToken) {
          // Handle legacy token format
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          if (data.session) {
            setIsValidSession(true)
          } else {
            console.error('Failed to set session:', sessionError)
            setStatus('error')
            setMessage('Invalid or expired password reset link. Please request a new one.')
          }
        } else {
          setStatus('error')
          setMessage('Invalid password reset link. Please request a new one.')
        }
      }
    }
    
    checkSession()
  }, [searchParams, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters long')
      return
    }

    setStatus('loading')
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('success')
      setMessage('Password updated successfully! Redirecting...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  if (!isValidSession && status !== 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <p className={styles.loadingMessage}>Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (status === 'error' && !isValidSession) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h2 className={styles.title}>Password Reset Error</h2>
          <div className={`${styles.statusMessage} ${styles.error}`}>
            <FaExclamationCircle className={styles.statusIcon} />
            <span>{message}</span>
          </div>
          <button 
            onClick={() => router.push('/auth/forgot-password')}
            className={styles.backButton}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Update Password</h2>
        <p className={styles.subtitle}>Enter your new password below.</p>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaLock />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="New password"
              required
              minLength={6}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaLock />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Confirm new password"
              required
              minLength={6}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <SubmitButton>
            {status === 'loading' ? 'Updating...' : 'Update Password'}
          </SubmitButton>
        </form>

        {status === 'success' && (
          <div className={`${styles.statusMessage} ${styles.success}`}>
            <FaCheckCircle className={styles.statusIcon} />
            <span>{message}</span>
          </div>
        )}
        {status === 'error' && message && (
          <div className={`${styles.statusMessage} ${styles.error}`}>
            <FaExclamationCircle className={styles.statusIcon} />
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const UpdatePasswordPage = () => {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.formCard}>
          <p className={styles.loadingMessage}>Loading...</p>
        </div>
      </div>
    }>
      <UpdatePasswordClient />
    </Suspense>
  )
}

export default UpdatePasswordPage
