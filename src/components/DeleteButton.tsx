'use client'

import { useFormStatus } from 'react-dom'
import { FaTrashAlt, FaSpinner } from 'react-icons/fa'
import styles from './DeleteButton.module.css'

const DeleteButton = () => {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={styles.button}
    >
      {pending ? (
        <FaSpinner className={`${styles.icon} ${styles.spin}`} />
      ) : (
        <FaTrashAlt className={styles.icon} />
      )}
    </button>
  )
}

export default DeleteButton