'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileDropdown from './ProfileDropdown';
import Image from 'next/image';
import styles from './Header.module.css';

type UserState = {
  authenticated: boolean;
  role?: string;
} | null;

const Header = () => {
  // Change initial state to null to indicate loading/unknown state
  const [userState, setUserState] = useState<UserState>(null);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setUserState(data.authenticated ? { authenticated: true, role: data.role } : { authenticated: false });
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setUserState({ authenticated: false });
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 70) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const isAuthenticated = userState?.authenticated;
  const isAdmin = userState?.role === 'admin';

  return (
    <header className={`${styles.header} ${isScrollingDown ? styles.headerHidden : ''}`}>
      <nav className={styles.nav}>
        <div className={styles.leftNav}>
          <div className={styles.logo}>
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Driving School Logo"
                width={150}
                height={50}
                priority
              />
            </Link>
          </div>
          {/* Show navigation only if user is not an admin */}
          {(userState?.role !== 'admin') && (
            <ul className={styles.navList}>
              <li><Link href="/" className={styles.navItem}>Home</Link></li>
              <li><Link href="/about" className={styles.navItem}>About</Link></li>
              <li><Link href="/contact" className={styles.navItem}>Contact</Link></li>
              <li><Link href="/instructors" className={styles.navItem}>Instructors</Link></li>
              {isAuthenticated && (
                <li><Link href="/bookings" className={styles.navItem}>My Bookings</Link></li>
              )}
            </ul>
          )}
        </div>
        
        <div className={styles.rightNav}>
          {/* Only render if the authentication status is known */}
          {isAuthenticated === true ? (
            <ProfileDropdown />
          ) : isAuthenticated === false ? (
            <Link href="/auth/sign-up" className={styles.signUpButton}>
              Sign Up
            </Link>
          ) : (
            <div style={{ width: '80px', height: '40px' }}></div> // Add a placeholder to maintain layout
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;