'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import RatingModal from '@/components/RatingModal';
import styles from './instructors.module.css';

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  rating: number;
  lesson_price: number;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingInstructor, setRatingInstructor] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('instructors')
        .select(`
          id,
          profiles (
            first_name,
            last_name
          ),
          bio,
          rating,
          lesson_price
        `);

      if (error) {
        console.error('Error fetching instructors:', error);
        return;
      }

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          first_name: (item.profiles as { first_name: string | null })?.first_name || '',
          last_name: (item.profiles as { last_name: string | null })?.last_name || '',
          bio: item.bio || '',
          rating: item.rating || 0,
          lesson_price: item.lesson_price || 0
        }));
        setInstructors(formattedData as Instructor[]);
        if (formattedData.length > 0) {
          setSelectedInstructor(formattedData[0] as Instructor);
        }
      }
    };
    fetchInstructors();
  }, []);

  const handleRateInstructor = (instructor: Instructor) => {
    setRatingInstructor({
      id: instructor.id,
      name: `${instructor.first_name} ${instructor.last_name}`
    });
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setRatingInstructor(null);
    // Refresh instructor data to show updated ratings
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Our Instructors</h1>
      <div className={styles.contentWrapper}>
        <div className={styles.instructorListCard}>
          <h2 className={styles.cardTitle}>Instructors</h2>
          <ul className={styles.list}>
            {instructors.map(instructor => (
              <li
                key={instructor.id}
                className={`${styles.listItem} ${selectedInstructor?.id === instructor.id ? styles.active : ''}`}
                onClick={() => setSelectedInstructor(instructor)}
              >
                {instructor.first_name} {instructor.last_name}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.detailsCard}>
          {selectedInstructor ? (
            <div>
              <h2 className={styles.cardTitle}>{selectedInstructor.first_name} {selectedInstructor.last_name}</h2>
              <p className={styles.rating}>⭐ {selectedInstructor.rating ? selectedInstructor.rating.toFixed(1) : 'No reviews'}</p>
              <p className={styles.price}>
                Lesson Price: <strong>R{selectedInstructor.lesson_price.toFixed(2)}</strong>
              </p>
              <p className={styles.bio}>{selectedInstructor.bio || 'No bio available.'}</p>
              <div className={styles.actionButtons}>
                <Link href={`/book-lesson?instructorId=${selectedInstructor.id}`} className={styles.bookButton}>
                  Book a Lesson
                </Link>
                <button 
                  onClick={() => handleRateInstructor(selectedInstructor)}
                  className={styles.rateButton}
                >
                  Rate Instructor
                </button>
              </div>
            </div>
          ) : (
            <p className={styles.noInstructor}>Select an instructor to view their details.</p>
          )}
        </div>
      </div>
      
      {/* Rating Modal */}
      {showRatingModal && ratingInstructor && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={closeRatingModal}
          instructorId={ratingInstructor.id}
          instructorName={ratingInstructor.name}
        />
      )}
    </div>
  );
}
