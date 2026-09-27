import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sherloque — Fabric Investigation Agent',
  description: 'Autonomous forensic intelligence for Hyperledger Fabric',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-white antialiased">{children}</body>
    </html>
  )
}
