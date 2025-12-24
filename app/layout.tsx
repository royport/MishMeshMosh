import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/toast-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mishmeshmosh.com'),
  title: {
    default: 'MishMeshMosh - Turn Shared Needs Into Supplier-Ready Deals',
    template: '%s | MishMeshMosh',
  },
  description:
    'A demand-first platform that turns shared needs into supplier-ready contract packets through digital deeds. Join campaigns, pool demand, and trigger supply without upfront risk.',
  keywords: [
    'group buying',
    'bulk purchasing',
    'demand aggregation',
    'collective purchasing',
    'deed platform',
    'supplier marketplace',
  ],
  authors: [{ name: 'MishMeshMosh' }],
  creator: 'MishMeshMosh',
  publisher: 'MishMeshMosh',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mishmeshmosh.com',
    siteName: 'MishMeshMosh',
    title: 'MishMeshMosh - Turn Shared Needs Into Supplier-Ready Deals',
    description:
      'A demand-first platform that turns shared needs into supplier-ready contract packets through digital deeds.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MishMeshMosh - Need-to-Deed Demand Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MishMeshMosh - Turn Shared Needs Into Supplier-Ready Deals',
    description:
      'A demand-first platform that turns shared needs into supplier-ready contract packets through digital deeds.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ToastProvider>
          <div id="main-content">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
