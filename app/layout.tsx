import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Source_Code_Pro } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ 
  variable: '--font-jakarta', 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const sourceCode = Source_Code_Pro({
  variable: '--font-source-code',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Autonomous Drone SAR System',
  description: 'Search and rescue drone simulation with real-time telemetry dashboard',
  authors: [{ name: 'Nihara Dayarathne', url: 'mailto:shniharard@gmail.com' }],
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${sourceCode.variable}`} style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #f8fafc 100%)' }}>
      <body className="font-jakarta antialiased text-foreground" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #f8fafc 100%)' }}>
        {children}
      </body>
    </html>
  )
}
