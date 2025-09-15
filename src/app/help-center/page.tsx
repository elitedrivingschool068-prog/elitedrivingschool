import styles from './help-center.module.css';

export default function HelpCenterPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Help Center</h1>
      <p className={styles.subtitle}>Find answers to common questions or get in touch with our support team.</p>
      <div className={styles.contactInfo}>
        <p><strong>Email:</strong> elitedrivingschool@gmail.com</p>
        <p><strong>Phone:</strong> +27 73 510 5494</p>
      </div>
    </div>
  );
}