'use client'

import { FaSignOutAlt } from 'react-icons/fa'
import { signOut } from '@/lib/actions/auth'
import styles from './SignOutButton.module.css'

interface SignOutButtonProps {
  className?: string
}

const SignOutButton = ({ className }: SignOutButtonProps) => {
  return (
    <form action={signOut}>
      <button type="submit" className={className || styles.button}>
        <FaSignOutAlt className={styles.icon} />
        Sign Out
      </button>
    </form>
  )
}

export default SignOutButton