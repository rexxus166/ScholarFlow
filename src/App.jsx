import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckSquare, Clock, FileText, Calendar, BarChart2, Moon, Sun } from 'lucide-react';
import { TaskProvider } from './contexts/TaskContext';
import { NoteProvider } from './contexts/NoteContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import SplashScreen from './components/SplashScreen';

import Home from './pages/Home';
import Tasks from './pages/Tasks';
import TasksArchive from './pages/TasksArchive';
import Focus from './pages/Focus';
import Notes from './pages/Notes';
import NoteDetail from './pages/NoteDetail';
import Progress from './pages/Progress';
import Timetable from './pages/Timetable';
import ScheduleToday from './pages/ScheduleToday';

// Komponen scroll to top otomatis tiap ganti route
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`font-semibold text-sm transition-all px-5 py-2 rounded-full block w-full lg:w-auto lg:inline-block ${isActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-main hover:bg-bg-main'}`}
    >
      {children}
    </Link>
  );
};

const MobileNavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'fill-primary/20 stroke-primary' : 'stroke-current'}`} />
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
};

function MobileNavigation() {
  const { t } = useLanguage();
  const location = useLocation();
  
  // Sembunyikan bottom nav di landing page
  if (location.pathname === '/') return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-main/95 backdrop-blur-xl border-t border-border/50 flex justify-around items-center px-2 z-50">

      <MobileNavLink to="/tasks" icon={CheckSquare} label={t('nav.tasks')} />
      <MobileNavLink to="/focus" icon={Clock} label={t('nav.focus')} />
      <MobileNavLink to="/notes" icon={FileText} label={t('nav.notes')} />
      <MobileNavLink to="/schedule" icon={Calendar} label={t('nav.schedule')} />
      <MobileNavLink to="/progress" icon={BarChart2} label={t('nav.progress')} />
    </div>
  );
}

function Navigation({ isDark, toggleDark }) {
  const { lang, toggleLang, t } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-bg-main/80 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        
        {/* Logo - Kiri */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="ScholarFlow Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="text-xl font-black tracking-tight text-primary hidden sm:inline-block">
            ScholarFlow <span className="text-secondary/80 font-bold"></span>
          </span>
        </Link>

        {/* Floating Pill Nav - Tengah (Desktop Only) - Sembunyikan di Home */}
        {!isHome && (
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center">
            <div className="flex items-center gap-1">
              <NavLink to="/tasks">{t('nav.tasks')}</NavLink>
              <NavLink to="/focus">{t('nav.focus')}</NavLink>
              <NavLink to="/notes">{t('nav.notes')}</NavLink>
              <NavLink to="/schedule">{t('nav.schedule')}</NavLink>
              <NavLink to="/progress">{t('nav.progress')}</NavLink>
            </div>
          </div>
        )}

        {/* Actions - Kanan (Desktop & Mobile) */}
        <div className="flex items-center gap-2">
          {/* Dark Mode */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-full bg-bg-card border border-border/50 text-text-muted hover:text-primary hover:border-primary/30 transition-all shadow-sm"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Toggle */}
          <div className="flex items-center bg-bg-card border border-border/50 rounded-full shadow-sm overflow-hidden">
            {['en', 'id', 'jv'].map((l) => (
              <button
                key={l}
                onClick={() => toggleLang(l)}
                className={`px-3 py-1.5 text-xs font-black tracking-wider transition-all ${
                  lang === l
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-primary hover:bg-border/30'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function MainApp({ isDark, toggleDark }) {
  const { t, lang, toggleLang } = useLanguage();
  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans selection:bg-primary/30 flex flex-col pb-24 lg:pb-0 relative">
      
      {/* ── Polished Background Layer ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 flex w-full h-full overflow-hidden">
        {/* Soft Blobs */}
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70" />
        <div className="absolute top-[60%] -right-[10%] w-[40vw] h-[40vw] bg-secondary/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70" />
        <div className="absolute top-[20%] left-[50%] w-[30vw] h-[30vw] bg-accent/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50" />
        
        {/* Dot Pattern Texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(var(--color-text-main) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <ScrollToTop />
      <Navigation isDark={isDark} toggleDark={toggleDark} />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/archive" element={<TasksArchive />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/schedule" element={<Timetable />} />
          <Route path="/schedule/today" element={<ScheduleToday />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
      <ToastContainer position="bottom-right" theme={isDark ? 'dark' : 'colored'} hideProgressBar autoClose={3000} />

      <footer className="border-t border-border/30 py-4 mt-12 pb-24 lg:pb-4">
        <p className="text-center text-text-muted/40 text-[11px] font-medium tracking-wide px-4">
          {t('nav.built')}
        </p>
      </footer>
      <MobileNavigation />
    </div>
  );
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('scholarflow_dark');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Splash hanya sekali per sesi browser
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('scholarflow_splashed')
  );

  useEffect(() => {
    localStorage.setItem('scholarflow_dark', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);

  const handleSplashFinish = () => {
    sessionStorage.setItem('scholarflow_splashed', '1');
    setShowSplash(false);
  };

  return (
    <LanguageProvider>
      <TaskProvider>
        <NoteProvider>
          <ScheduleProvider>
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
            <Router>
              <MainApp isDark={isDark} toggleDark={toggleDark} />
            </Router>
          </ScheduleProvider>
        </NoteProvider>
      </TaskProvider>
    </LanguageProvider>
  )
}

export default App;
