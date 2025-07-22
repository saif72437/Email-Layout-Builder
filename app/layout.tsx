import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Email Layout Builder',
  description: 'Created and developed by Saifullah Khan',
 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
