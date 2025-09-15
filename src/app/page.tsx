import Link from 'next/link'
import styles from './page.module.css'
import Image from 'next/image'
import heroBg from '../../public/images/hero-bg.jpg'
import AdminAccessButton from '@/components/AdminAccessButton'

export default function HomePage() {
  return (
    <div className={styles.container}>
      <AdminAccessButton />
      <main>
        {/* Hero Section */}
        <section id="hero" className={styles.heroSection}>
          <div className={styles.imageWrapper}>
            <Image
              src={heroBg}
              alt="Driving on an open road"
              fill
              style={{ objectFit: 'cover', zIndex: -1 }}
              priority
            />
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Your Journey to the Open Road Starts Here.</h1>
            <p className={styles.heroSubtitle}>
              Expert driving lessons tailored to your needs.
            </p>
            {/* Change the href to go to the Instructors page */}
            <Link href="/instructors" className={styles.bookButton}>
              Book a Lesson
            </Link>
          </div>
        </section>

        {/* Introduction Section */}
        <section id="introduction" className={styles.introSection}>
          <div className={styles.introContent}>
            <h2 className={styles.introTitle}>Learn to Drive with Confidence.</h2>
            <p className={styles.introText}>
              Our certified instructors provide comprehensive training in a safe and supportive environment. From your first lesson to passing your final exam, we&apos;re with you every step of the way. We focus on building not just your skills, but your confidence behind the wheel.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}