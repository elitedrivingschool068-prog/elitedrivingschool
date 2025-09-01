'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './booking.module.css';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/app/components/DashboardLayout';

const generateTimeSlots = (date) => {
  const slots = [];
  const startHour = 8;
  const endHour = 17;

  for (let i = startHour; i <= endHour; i++) {
    const slotStart = new Date(date);
    slotStart.setHours(i, 0, 0, 0);

    const slotEnd = new Date(date);
    slotEnd.setHours(i, 59, 59, 999);

    slots.push({
      start: slotStart,
      end: slotEnd,
    });
  }
  return slots;
};

export default function BookingPage() {
  const [date, setDate] = useState(new Date());
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
          throw new Error('User not authenticated');
        }
        setUser(session.user);

        const { data: instructorsData, error: instructorsError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', 'instructor');

        if (instructorsError) throw instructorsError;
        setInstructors(instructorsData);

        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, make, model, is_available')
          .eq('is_available', true);

        if (vehiclesError) throw vehiclesError;
        setVehicles(vehiclesData);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('start_time', date.toISOString().split('T')[0] + 'T00:00:00Z')
        .lte('end_time', date.toISOString().split('T')[0] + 'T23:59:59Z');

      if (error) {
        console.error("Failed to fetch bookings:", error);
        return;
      }
      setBookings(data);
    };
    fetchBookings();
  }, [date]);

  useEffect(() => {
    if (date && instructors.length > 0 && vehicles.length > 0) {
      const allSlots = generateTimeSlots(date);

      const filteredSlots = allSlots.filter(slot => {
        const conflictingBookings = bookings.filter(
          b => new Date(b.start_time).getTime() === slot.start.getTime()
        );

        const busyInstructorIds = conflictingBookings.map(b => b.instructor_id);
        const busyVehicleIds = conflictingBookings.map(b => b.vehicle_id);

        const hasAvailableInstructor = instructors.some(i => !busyInstructorIds.includes(i.id));
        const hasAvailableVehicle = vehicles.some(v => !busyVehicleIds.includes(v.id));

        return hasAvailableInstructor && hasAvailableVehicle;
      });

      setAvailableSlots(filteredSlots);
    }
  }, [date, bookings, instructors, vehicles]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleBooking = async (slot) => {
    if (!user) {
      alert("You must be logged in to book a lesson.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      alert("Your profile is not correctly set up. Please contact support.");
      return;
    }
    
    const conflictingBookings = bookings.filter(
      b => new Date(b.start_time).getTime() === slot.start.getTime()
    );

    const busyInstructorIds = conflictingBookings.map(b => b.instructor_id);
    const busyVehicleIds = conflictingBookings.map(b => b.vehicle_id);

    const availableInstructor = instructors.find(i => !busyInstructorIds.includes(i.id));
    const availableVehicle = vehicles.find(v => !busyVehicleIds.includes(v.id));

    if (!availableInstructor || !availableVehicle) {
      alert("Sorry, this slot was just booked. Please select another one.");
      const { data: updatedBookings } = await supabase
        .from('bookings')
        .select('*')
        .gte('start_time', date.toISOString().split('T')[0] + 'T00:00:00Z')
        .lte('end_time', date.toISOString().split('T')[0] + 'T23:59:59Z');
      setBookings(updatedBookings);
      return;
    }

    const instructorId = availableInstructor.id;
    const vehicleId = availableVehicle.id;

    const bookingData = {
      student_id: profile.id,
      instructor_id: instructorId,
      vehicle_id: vehicleId,
      start_time: slot.start.toISOString(),
      end_time: slot.end.toISOString(),
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData]);

    if (error) {
      console.error("Booking failed:", error);
      alert("Booking failed: " + error.message);
    } else {
      alert("Booking successful! Your lesson is pending confirmation.");
      const { data: updatedBookings } = await supabase
        .from('bookings')
        .select('*')
        .gte('start_time', date.toISOString().split('T')[0] + 'T00:00:00Z')
        .lte('end_time', date.toISOString().split('T')[0] + 'T23:59:59Z');
      
      setBookings(updatedBookings);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.container}>Loading...</div>
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
        <h1 className={styles.heading}>Book a Driving Lesson</h1>
        <div className={styles.calendarContainer}>
          <Calendar key={date ? date.toISOString() : 'calendar'} onChange={handleDateChange} value={date} />
        </div>
        <div className={styles.slotsContainer}>
          <h3>Available Slots for {date.toDateString()}</h3>
          {availableSlots.length > 0 ? (
            availableSlots.map((slot, index) => (
              <div
                key={index}
                className={styles.slot}
                onClick={() => handleBooking(slot)}
              >
                <p>
                  {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                  {slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          ) : (
            <p>No available slots for this date.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}