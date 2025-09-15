// src/components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.column}>
          <Image
            src="/images/logo.png"
            alt="Elite Driving School Logo"
            width={120}
            height={40}
            className={styles.logo}
          />
          <p className={styles.aboutText}>Your journey to the open road starts here. Expert driving lessons tailored to your needs.</p>
          <p className={styles.copyright}>&copy; 2025 Driving School. All rights reserved.</p>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Quick Links</h3>
          <ul className={styles.linkList}>
            <li><Link href="/" className={styles.linkItem}>Home</Link></li>
            <li><Link href="/about" className={styles.linkItem}>About</Link></li>
            <li><Link href="/contact" className={styles.linkItem}>Contact</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Support</h3>
          <ul className={styles.linkList}>
            {/* Update the hrefs here */}
            <li><Link href="/faqs" className={styles.linkItem}>FAQs</Link></li>
            <li><Link href="/help-center" className={styles.linkItem}>Help Center</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;