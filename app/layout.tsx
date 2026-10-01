import type { Metadata } from 'next';
import { IBM_Plex_Mono, Public_Sans } from 'next/font/google';
import './globals.css';

const body = Public_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const data = IBM_Plex_Mono({ subsets: ['latin'], weight: '500', variable: '--font-data', display: 'swap' });

export const metadata: Metadata = {
  title: 'Elevate 215 Visit Notes',
  description: 'School visit notes with a metric and an on/off-track status, filterable across schools and funders.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${data.variable}`}>
      <body>{children}</body>
    </html>
  );
}
