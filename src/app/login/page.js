'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        setError("User profile not found. Please contact support.");
        return;
      }

      if (profile.role === 'instructor') {
        router.push('/instructor');
      } else {
        router.push('/booking');
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Create a profile for the new user
      await supabase
        .from('profiles')
        .insert([{ id: user.id, role: 'student' }]);
        
      alert('Sign up successful! Please check your email for a confirmation link.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Elite Driving School</h1>
      <form className={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" onClick={handleSignIn}>Sign In</button>
        <button type="button" onClick={handleSignUp}>Sign Up</button>
      </form>
    </div>
  );
}