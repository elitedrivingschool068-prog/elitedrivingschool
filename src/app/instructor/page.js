'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './instructor.module.css';
import DashboardLayout from '@/app/components/DashboardLayout'; // New import

export default function InstructorDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          // No redirect here, Layout component will handle it
          throw new Error('User not authenticated');
        }
        setUser(session.user);

        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            student:profiles!bookings_student_id_fkey (first_name, last_name, phone_number),
            instructor:profiles!bookings_instructor_id_fkey (first_name, last_name),
            vehicles (make, model, license_plate)
          `)
          .eq('instructor_id', session.user.id)
          .order('start_time', { ascending: true });

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.container}>Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className={styles.container}>Error: {error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Instructor Dashboard</h1>
        <p className={styles.subheading}>Your upcoming lessons</p>

        {bookings.length === 0 ? (
          <p className={styles.noLessons}>You have no upcoming lessons.</p>
        ) : (
          <div className={styles.bookingsList}>
            {bookings.map(booking => (
              <div key={booking.id} className={styles.bookingCard}>
                <p className={styles.bookingTime}>
                  <span className={styles.label}>Time:</span> {new Date(booking.start_time).toLocaleString()}
                </p>
                <p className={styles.bookingDetails}>
                  <span className={styles.label}>Student:</span> {booking.student?.first_name} {booking.student?.last_name}
                </p>
                <p className={styles.bookingDetails}>
                  <span className={styles.label}>Vehicle:</span> {booking.vehicles?.make} {booking.vehicles?.model}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}