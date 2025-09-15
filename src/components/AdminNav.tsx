'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AdminNav.module.css'

const AdminNav = () => {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: '👥'
    },
    {
      href: '/admin/instructors',
      label: 'Instructors',
      icon: '🚗'
    },
    {
      href: '/admin/bookings',
      label: 'Bookings',
      icon: '📅'
    }
  ]

  return (
    <nav className={styles.adminNav}>
      <div className={styles.navHeader}>
        <h2 className={styles.navTitle}>Admin Panel</h2>
      </div>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.href} className={styles.navItem}>
            <Link
              href={item.href}
              className={`${styles.navLink} ${
                pathname === item.href ? styles.active : ''
              }`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.navFooter}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </div>
    </nav>
  )
}

export default AdminNav