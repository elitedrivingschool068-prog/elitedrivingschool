'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from '../Layout.module.css';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out failed:", error);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Elite Driving School</h1>
        <button onClick={handleSignOut} className={styles.signOutButton}>Sign Out</button>
      </header>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
