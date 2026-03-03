import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Menu, X } from 'lucide-react';
import { TaskProvider } from './contexts/TaskContext';
import { NoteProvider } from './contexts/NoteContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Focus from './pages/Focus';
import Notes from './pages/Notes';
import Progress from './pages/Progress';
import Timetable from './pages/Timetable';

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`font-medium transition-all px-4 py-2 rounded-xl block w-full md:w-auto md:inline-block ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-text-muted hover:text-text-main hover:bg-bg-main'}`}
    >
      {children}
    </Link>
  );
};

function Navigation() {
  const { lang, toggleLang, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-bg-main/80 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary via-indigo-500 to-secondary flex items-center gap-2 hover:opacity-80 transition-opacity">
            ScholarFlow
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/tasks">{t('nav.tasks')}</NavLink>
            <NavLink to="/focus">{t('nav.focus')}</NavLink>
            <NavLink to="/notes">{t('nav.notes')}</NavLink>
            <NavLink to="/schedule">{t('nav.schedule')}</NavLink>
            <NavLink to="/progress">{t('nav.progress')}</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 bg-bg-card border border-border/50 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-sm text-text-muted hover:text-primary transition-colors shadow-sm"
          >
            <span className={lang === 'en' ? 'text-primary' : ''}>EN</span>
            <span className="text-border/50">|</span>
            <span className={lang === 'id' ? 'text-primary' : ''}>ID</span>
          </button>

          <button className="md:hidden p-2 text-text-muted hover:text-text-main" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-bg-main/95 backdrop-blur-xl border-b border-border/50 p-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            <NavLink to="/tasks" onClick={() => setIsMenuOpen(false)}>{t('nav.tasks')}</NavLink>
            <NavLink to="/focus" onClick={() => setIsMenuOpen(false)}>{t('nav.focus')}</NavLink>
            <NavLink to="/notes" onClick={() => setIsMenuOpen(false)}>{t('nav.notes')}</NavLink>
            <NavLink to="/schedule" onClick={() => setIsMenuOpen(false)}>{t('nav.schedule')}</NavLink>
            <NavLink to="/progress" onClick={() => setIsMenuOpen(false)}>{t('nav.progress')}</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

function MainApp() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans selection:bg-primary/30 flex flex-col">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/schedule" element={<Timetable />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
      <ToastContainer position="bottom-right" theme="colored" hideProgressBar autoClose={3000} />

      <footer className="border-t border-border/50 py-6 mt-8 shrink-0">
        <div className="container mx-auto px-4 text-center text-text-muted text-sm font-medium">
          {t('nav.built')}
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <TaskProvider>
        <NoteProvider>
          <ScheduleProvider>
            <Router>
              <MainApp />
            </Router>
          </ScheduleProvider>
        </NoteProvider>
      </TaskProvider>
    </LanguageProvider>
  )
}

export default App;
