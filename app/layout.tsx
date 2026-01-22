import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UDL STEM Lab',
  description: 'Mobile-first learning app with UDL supports and AI scaffolding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
