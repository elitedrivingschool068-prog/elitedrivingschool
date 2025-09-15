'use client'

import { useState } from 'react'
import { FaEnvelope, FaLock, FaUserPlus, FaSignInAlt, FaExclamationCircle } from 'react-icons/fa'
import { signIn, signUp } from '@/lib/actions/auth'
import styles from './AuthForm.module.css'
import SubmitButton from './SubmitButton'
import Link from 'next/link'

const AuthForm = () => {
  const [isSigningIn, setIsSigningIn] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    let result
    if (isSigningIn) {
      result = await signIn(formData)
    } else {
      result = await signUp(formData)
    }

    if (result && !result.success) {
      setError(result.error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>
          {isSigningIn ? 'Sign In' : 'Sign Up'}
        </h2>
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
              placeholder="Email address"
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
          {isSigningIn && (
            <div className={styles.forgotPassword}>
              <Link href="/auth/forgot-password" className={styles.forgotPasswordLink}>
                Forgot password?
              </Link>
            </div>
          )}
          <div>
            <SubmitButton>
              {isSigningIn ? (
                <span className="flex items-center"><FaSignInAlt className="mr-2" /> Sign In</span>
              ) : (
                <span className="flex items-center"><FaUserPlus className="mr-2" /> Sign Up</span>
              )}
            </SubmitButton>
          </div>
        </form>
        <div className={styles.linkGroup}>
          <span className={styles.linkText}>
            {isSigningIn ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => setIsSigningIn(!isSigningIn)}
          >
            {isSigningIn ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm