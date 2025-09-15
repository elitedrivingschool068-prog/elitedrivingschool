'use client'

import Link from 'next/link'
import { FaUserShield } from 'react-icons/fa'
import styles from './AdminAccessButton.module.css'

interface AdminAccessButtonProps {
  variant?: 'fixed' | 'inline'
}

const AdminAccessButton = ({ variant = 'fixed' }: AdminAccessButtonProps) => {
  const buttonClass = variant === 'inline' ? styles.adminButtonInline : styles.adminButton
  
  return (
    <Link href="/auth/admin-sign-in" className={buttonClass}>
      <FaUserShield className={styles.icon} />
      {variant === 'inline' && <span className={styles.text}>Admin</span>}
    </Link>
  )
}

export default AdminAccessButton
