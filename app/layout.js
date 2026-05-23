export const metadata = {
  title: 'Odds Engine Pro',
  description: 'Comparador de odds esportivas com Dutching',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: '#0a0d14', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
