import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Futsar App',
  description: 'Futsar App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <head />
      <body className="font-sans antialiased bg-[#0a0a0a] text-white overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
