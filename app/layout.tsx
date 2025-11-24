import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NurseNote AI',
  description: '精神科訪問看護 記録支援',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}

