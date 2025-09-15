import styles from './contact.module.css';

const ContactPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.description}>
          We&apos;d love to hear from you! Please feel free to reach out with any questions about our driving lessons, scheduling, or general inquiries.
        </p>
        <div className={styles.contactInfo}>
          <p className={styles.contactItem}>
            <strong>Email:</strong> elitedrivingschool068@.com
          </p>
          <p className={styles.contactItem}>
            <strong>Phone:</strong> +27 73 510 5496
          </p>
          <p className={styles.contactItem}>
            <strong>Address:</strong> 2 St Michaels, Southernwood, East London, 5203
          </p>
        </div>
        <div className={styles.contactForm}>
          <form className={styles.form}>
            <label htmlFor="name" className={styles.label}>Name</label>
            <input type="text" id="name" name="name" className={styles.input} />

            <label htmlFor="email" className={styles.label}>Email</label>
            <input type="email" id="email" name="email" className={styles.input} />

            <label htmlFor="message" className={styles.label}>Message</label>
            <textarea id="message" name="message" rows={4} className={styles.textarea}></textarea>

            <button type="submit" className={styles.submitButton}>Send Message</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;