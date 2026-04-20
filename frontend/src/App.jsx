import { HashRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import Navbar        from './components/Navbar'
import Home          from './pages/Home'
import Gallery       from './pages/Gallery'
import PatternDetail from './pages/PatternDetail'
import AIGenerator   from './pages/AIGenerator'
import Login         from './pages/Login'
import Upload        from './pages/Upload'
import Footer from './components/Footer'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    }
  }
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <div
            style={{
              minHeight: '100vh',
              backgroundColor: '#fdfcfb',
              width: '100%',
              overflowX: 'hidden',
            }}
          >
            <Navbar />
            <main
              style={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 24px',
              }}
            >
              <Routes>
                <Route path="/"             element={<Home />} />
                <Route path="/gallery"      element={<Gallery />} />
                <Route path="/patterns"     element={<Gallery />} />
                <Route path="/patterns/:id" element={<PatternDetail />} />
                <Route path="/ai-generator" element={<AIGenerator />} />
                <Route path="/login"        element={<Login />} />
                <Route path="/upload"       element={<Upload />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}