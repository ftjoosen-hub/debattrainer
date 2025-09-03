import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Debatcoach AI - Kritische Tegenargumenten',
  description: 'Train je debatvaardigheden met AI-gegenereerde tegenargumenten en krijg constructieve feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="bg-gray-100 min-h-screen" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
} 