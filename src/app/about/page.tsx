import styles from './about.module.css';

const AboutPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>About Us</h1>
        <p className={styles.description}>
          We are a leading driving school dedicated to providing high-quality driving lessons that build confidence and skills for a lifetime of safe driving. Our certified instructors use a comprehensive curriculum to ensure every student is prepared for their driving test and beyond.
        </p>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Our Mission</h2>
          <p className={styles.cardText}>
            Our mission is to empower individuals with the knowledge and skills needed to navigate the roads safely and responsibly. We believe in creating a supportive learning environment where every student can thrive.
          </p>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Our Instructors</h2>
          <p className={styles.cardText}>
            Our team of experienced and patient instructors is certified and committed to your success. They provide personalized one-on-one training to cater to each student&apos;s unique learning style.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;