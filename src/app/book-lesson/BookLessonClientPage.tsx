'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './book-lesson.module.css';
import { createBooking } from '@/lib/actions/booking';

interface BookLessonClientPageProps {
  userId: string;
  instructorId: string;
}

export default function BookLessonClientPage({ userId, instructorId }: BookLessonClientPageProps) {
  const router = useRouter();
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Generates 30-minute time options from 8:00 AM to 5:00 PM
  const generateTimeOptions = () => {
    const options = [];
    const startTime = 8;
    const endTime = 17;

    for (let hour = startTime; hour <= endTime; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endTime && minute > 0) continue; // Stop at 5:00 PM
        const hourString = hour.toString().padStart(2, '0');
        const minuteString = minute.toString().padStart(2, '0');
        options.push(`${hourString}:${minuteString}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const bookingDate = new Date(date);
    // Check if the selected day is a Sunday (day 0)
    if (bookingDate.getDay() === 0) {
      setMessage('Booking is not available on Sundays.');
      setIsSubmitting(false);
      return;
    }

    // Check if time is selected
    if (!date || !time) {
      setMessage('Please select both a date and a time.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('instructorId', instructorId);
    formData.append('lessonDate', date);
    formData.append('lessonTime', time);

    const result = await createBooking(formData);
    // Log the result here to see if it's successful or not
    console.log('Server Action Result:', result);

    if (result.success) {
      const bookingInfo = encodeURIComponent(JSON.stringify({ date, time }));
      router.push(`/checkout?instructorId=${instructorId}&bookingInfo=${bookingInfo}`);
    } else {
      setMessage(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Book a Lesson</h1>
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select a Date</label>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setMessage(null);
              }}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Select a Time</label>
            <select
              className={styles.input}
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                setMessage(null);
              }}
              required
            >
              <option value="">Select a time</option>
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={styles.bookButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>

        {message && <div className={styles.message}>{message}</div>}
      </div>
    </div>
  );
}