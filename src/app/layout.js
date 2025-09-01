import './globals.css';

export const metadata = {
  title: 'Elite Driving School',
  description: 'Book your driving lessons with the best instructors.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}