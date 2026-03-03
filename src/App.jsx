import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckSquare, Clock, FileText, Calendar, BarChart2 } from 'lucide-react';
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
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-main/95 backdrop-blur-xl border-t border-border/50 flex justify-around items-center px-2 z-50">
      <MobileNavLink to="/tasks" icon={CheckSquare} label={t('nav.tasks')} />
      <MobileNavLink to="/focus" icon={Clock} label={t('nav.focus')} />
      <MobileNavLink to="/notes" icon={FileText} label={t('nav.notes')} />
      <MobileNavLink to="/schedule" icon={Calendar} label={t('nav.schedule')} />
      <MobileNavLink to="/progress" icon={BarChart2} label={t('nav.progress')} />
    </div>
  );
}

function Navigation() {
  const { lang, toggleLang, t } = useLanguage();

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
        </div>
      </div>
    </nav>
  );
}

function MainApp() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans selection:bg-primary/30 flex flex-col pb-24 md:pb-0">
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

      <footer className="border-t border-border/50 py-6 mt-8 shrink-0 mb-20 md:mb-0">
        <div className="container mx-auto px-4 text-center text-text-muted text-sm font-medium">
          {t('nav.built')}
        </div>
      </footer>
      <MobileNavigation />
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
