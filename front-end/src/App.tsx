/* --- IMPORTS --- */
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';


/* --- PAGES IMPORTS --- */
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Resultados from '@/pages/Resultados';
import Perfil from '@/pages/Perfil';
import ChatCliente from '@/pages/ChatCliente';
import ChatSupervisor from '@/pages/ChatSupervisor';
import NotFound from '@/pages/NotFound';
import ForgotPassword from '@/pages/ForgotPassword';
import Termos from '@/pages/Termos';
import Privacidade from '@/pages/Privacidade';
import Sobre from '@/pages/Sobre';
import Cookies from '@/pages/Cookies';
import Configuracoes from '@/pages/Configuracoes';
import CookieConsent from '@/components/CookieConsent';


/* --- CODE --- */

// Initialize React Query Client
const queryClient = new QueryClient();

// Define the main App component
const App = () => {
  useEffect(() => {
    const applyTheme = () => {
      const saved = localStorage.getItem('theme') || 'auto';
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved === 'dark' || (saved === 'auto' && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
    };
    applyTheme();
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const saved = localStorage.getItem('theme') || 'auto';
      if (saved === 'auto') applyTheme();
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const LocationFade = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const [ready, setReady] = useState(false);
    useEffect(() => {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        setReady(true);
        return;
      }
      setReady(false);
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }, [location.pathname]);
    return (
      <div className={`transition-opacity duration-150 ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}>
        {children}
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LocationFade>
            <Routes>
              <Route path='/' element={<Index />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/onboarding' element={<Onboarding />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/resultados' element={<Resultados />} />
              <Route path='/perfil' element={<Perfil />} />
            <Route path='/chat/cliente' element={<ChatCliente />} />
            <Route path='/dashboard/contato' element={<ChatCliente />} />
              <Route path='/chat/supervisor/:sessionId?' element={<ChatSupervisor />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/termos' element={<Termos />} />
              <Route path='/privacidade' element={<Privacidade />} />
              <Route path='/sobre' element={<Sobre />} />
              <Route path='/cookies' element={<Cookies />} />
              <Route path='/configuracoes' element={<Configuracoes />} />
              <Route path='/dashboard/termos' element={<Termos />} />
              <Route path='/dashboard/privacidade' element={<Privacidade />} />
              <Route path='/dashboard/sobre' element={<Sobre />} />
              <Route path='/dashboard/cookies' element={<Cookies />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
            <CookieConsent />
          </LocationFade>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};


// Export the App component
export default App;
