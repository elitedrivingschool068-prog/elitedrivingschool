import styles from './faqs.module.css';

export default function FaqsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Frequently Asked Questions</h1>
      <div className={styles.faqSection}>
        <div className={styles.faqItem}>
          <h3 className={styles.question}>How do I book a lesson?</h3>
          <p className={styles.answer}>You can book a lesson by logging in to your dashboard and using the booking form provided on the main page. Select your preferred date, time, and instructor.</p>
        </div>
        <div className={styles.faqItem}>
          <h3 className={styles.question}>What is your cancellation policy?</h3>
          <p className={styles.answer}>Lessons must be canceled at least 24 hours in advance to avoid a cancellation fee. Please cancel through your dashboard or contact us directly.</p>
        </div>
      </div>
    </div>
  );
}