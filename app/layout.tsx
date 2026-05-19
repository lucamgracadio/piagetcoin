import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PiagetCoin — Recompensas Escolares em Blockchain',
  description:
    'Plataforma escolar de recompensas digitais. Professores enviam PGT para alunos diretamente na blockchain Ethereum.',
  keywords: ['piagetcoin', 'PGT', 'recompensas escolares', 'blockchain', 'educação'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 8%)',
              color: 'hsl(210 40% 98%)',
              border: '1px solid hsl(217 33% 14%)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#139bff', secondary: '#0a0f1e' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0f1e' } },
          }}
        />
      </body>
    </html>
  )
}
