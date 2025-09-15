'use client'

import { useFormStatus } from 'react-dom'
import styles from './SubmitButton.module.css'

const SubmitButton = ({ children }: { children: React.ReactNode }) => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={styles.submitButton}
      disabled={pending}
    >
      {pending ? 'Submitting...' : children}
    </button>
  )
}

export default SubmitButton