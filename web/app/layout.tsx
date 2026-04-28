import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';

const archivo = localFont({
  src: [
    { path: '../public/fonts/archivo-variable.ttf', style: 'normal' },
    { path: '../public/fonts/archivo-italic-variable.ttf', style: 'italic' },
  ],
  variable: '--font-archivo',
  display: 'swap',
});

const montserrat = localFont({
  src: [
    { path: '../public/fonts/montserrat-variable.ttf', style: 'normal' },
    { path: '../public/fonts/montserrat-italic-variable.ttf', style: 'italic' },
  ],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Harmoney AI Vigilance Agents',
  description:
    'A library of 9 specialised AML/CFT agents — auditable, primary-sourced, reviewer-ready.',
  icons: { icon: '/brand/harmoney-favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${archivo.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
