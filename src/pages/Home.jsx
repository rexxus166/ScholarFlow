import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTasks } from '../contexts/TaskContext';
import { useNotes } from '../contexts/NoteContext';
import { useSchedule } from '../contexts/ScheduleContext';
import { motion, useInView } from 'framer-motion';
import {
    CheckSquare, Clock, FileText, Calendar, BarChart2,
    ArrowRight, Shield, Zap, Globe, Star, ArrowUp
} from 'lucide-react';

// ── Animation helpers ─────────────────────────────────────────────────────────
const FadeUp = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// ── Feature card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc, to, glow, iconBg, badge, delay }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link to={to}>
                <div className="group relative bg-bg-card border border-border/60 rounded-3xl p-7 hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden h-full">
                    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${glow}`} />
                    {badge && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-4">
                            {badge}
                        </span>
                    )}
                    <div className={`inline-flex p-3.5 rounded-2xl mb-5 ${iconBg}`}>
                        <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-text-main mb-2.5 group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-5">{desc}</p>
                    <div className="flex items-center gap-1.5 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

// ── Scroll To Top Button ──────────────────────────────────────────────────────
const ScrollToTopBtn = () => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const toggle = () => setIsVisible(window.scrollY > 400);
        window.addEventListener('scroll', toggle);
        return () => window.removeEventListener('scroll', toggle);
    }, []);
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 hover:bg-primary-hover hover:scale-110 active:scale-95 transition-all ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
            <ArrowUp className="w-5 h-5" />
        </motion.button>
    );
};

// ── Live Stats from context ───────────────────────────────────────────────────
const LiveStatCard = ({ value, label, color = 'from-primary to-indigo-500' }) => (
    <div className="flex flex-col items-center px-5 py-4 bg-bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm min-w-[90px]">
        <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br ${color}`}>{value}</span>
        <span className="text-[11px] text-text-muted font-semibold mt-1 text-center leading-tight">{label}</span>
    </div>
);

// ── Main Landing Page ─────────────────────────────────────────────────────────
const Home = () => {
    const { t, lang } = useLanguage();
    const { tasks } = useTasks();
    const { notes } = useNotes();
    const { schedule } = useSchedule();

    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayEvents = schedule.filter(e => e.day === todayDay).length;

    const features = [
        {
            icon: CheckSquare, to: '/tasks',
            glow: 'bg-blue-500', iconBg: 'bg-blue-500/10 text-blue-500',
            badge: 'Eisenhower Matrix',
            title: t('home.feat1.title'), desc: t('home.feat1.desc'),
        },
        {
            icon: Clock, to: '/focus',
            glow: 'bg-primary', iconBg: 'bg-primary/10 text-primary',
            badge: 'Pomodoro + Audio',
            title: t('home.feat2.title'), desc: t('home.feat2.desc'),
        },
        {
            icon: FileText, to: '/notes',
            glow: 'bg-teal-500', iconBg: 'bg-teal-500/10 text-teal-500',
            badge: 'Markdown',
            title: t('home.feat3.title'), desc: t('home.feat3.desc'),
        },
        {
            icon: Calendar, to: '/schedule',
            glow: 'bg-purple-500', iconBg: 'bg-purple-500/10 text-purple-500',
            badge: lang === 'jv' ? 'Minggon + Agenda' : lang === 'id' ? 'Mingguan + Agenda' : 'Weekly + Agenda',
            title: t('home.feat4.title'), desc: t('home.feat4.desc'),
        },
        {
            icon: BarChart2, to: '/progress',
            glow: 'bg-green-500', iconBg: 'bg-green-500/10 text-green-500',
            badge: 'Real-time',
            title: t('home.feat5.title'), desc: t('home.feat5.desc'),
        },
    ];

    return (
        <div className="max-w-6xl mx-auto">

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="relative text-center pt-8 pb-16 overflow-hidden">
                {/* Bg glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-primary/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 left-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10"
                >


                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-indigo-500 to-secondary">
                            {t('home.title1')}
                        </span>
                        <br />
                        <span className="text-text-main">{t('home.title2')}</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                        {t('home.subtitle')}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <Link
                            to="/tasks"
                            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 text-lg"
                        >
                            {t('home.cta1')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/focus"
                            className="flex items-center gap-2 px-8 py-4 bg-bg-card border-2 border-primary/30 text-primary rounded-2xl font-bold hover:border-primary hover:bg-primary/5 transition-all transform hover:-translate-y-1 text-lg"
                        >
                            {t('home.cta2')}
                        </Link>
                    </div>

                    {/* Live stats from actual data */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <LiveStatCard
                            value={pendingTasks}
                            label={lang === 'jv' ? 'Ayahan Aktif' : lang === 'id' ? 'Tugas Aktif' : 'Active Tasks'}
                            color="from-blue-500 to-indigo-500"
                        />
                        <LiveStatCard
                            value={completedTasks}
                            label={lang === 'jv' ? 'Ayahan Purna' : lang === 'id' ? 'Tugas Selesai' : 'Tasks Done'}
                            color="from-green-500 to-emerald-500"
                        />
                        <LiveStatCard
                            value={notes.length}
                            label={lang === 'jv' ? 'Seratan' : lang === 'id' ? 'Catatan' : 'Notes'}
                            color="from-teal-500 to-cyan-500"
                        />
                        <LiveStatCard
                            value={todayEvents}
                            label={lang === 'jv' ? 'Acara Dintên Menika' : lang === 'id' ? 'Jadwal Hari Ini' : "Today's Events"}
                            color="from-purple-500 to-pink-500"
                        />
                        <LiveStatCard
                            value="∞"
                            label={lang === 'jv' ? 'Gratis Saklaminipun' : lang === 'id' ? 'Gratis Selamanya' : 'Free Forever'}
                            color="from-primary to-secondary"
                        />
                    </div>
                </motion.div>
            </section>

            {/* ── QUICK ACCESS SHORTCUTS ─────────────────────────────────────── */}
            <FadeUp className="pb-16">
                <div className="bg-bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-text-muted/60 mb-4 text-center">
                        {lang === 'jv' ? 'Akses Langsung' : lang === 'id' ? 'Akses Cepat' : 'Quick Access'}
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {[
                            { to: '/tasks', icon: CheckSquare, label: t('nav.tasks'), color: 'text-blue-500 bg-blue-500/10' },
                            { to: '/focus', icon: Clock, label: t('nav.focus'), color: 'text-primary bg-primary/10' },
                            { to: '/notes', icon: FileText, label: t('nav.notes'), color: 'text-teal-500 bg-teal-500/10' },
                            { to: '/schedule', icon: Calendar, label: t('nav.schedule'), color: 'text-purple-500 bg-purple-500/10' },
                            { to: '/progress', icon: BarChart2, label: t('nav.progress'), color: 'text-green-500 bg-green-500/10' },
                        ].map(({ to, icon: Icon, label, color }) => (
                            <Link key={to} to={to}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-border/30 transition-all group"
                            >
                                <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-text-muted group-hover:text-text-main transition-colors text-center leading-tight">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </FadeUp>

            {/* ── FEATURES ──────────────────────────────────────────────────── */}
            <section className="pb-20">
                <FadeUp className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold text-xs uppercase tracking-widest mb-4">
                        <Star className="w-3.5 h-3.5" />
                        {lang === 'jv' ? '5 Pirantos Produktivitas' : lang === 'id' ? '5 Fitur Utama' : '5 Core Features'}
                    </div>
                    <h2 className="text-4xl font-extrabold text-text-main mb-3">{t('home.features.title')}</h2>
                    <p className="text-text-muted text-lg max-w-xl mx-auto">{t('home.features.subtitle')}</p>
                </FadeUp>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    {features.slice(0, 3).map((feat, i) => (
                        <FeatureCard key={feat.to} {...feat} delay={i * 0.08} />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:px-20">
                    {features.slice(3).map((feat, i) => (
                        <FeatureCard key={feat.to} {...feat} delay={(i + 3) * 0.08} />
                    ))}
                </div>
            </section>


            {/* ── WHY SCHOLARFLOW ───────────────────────────────────────────── */}
            <FadeUp>
                <section className="pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                icon: Shield,
                                color: 'text-green-500 bg-green-500/10',
                                title: lang === 'jv' ? '100% Pribados' : lang === 'id' ? '100% Privat' : '100% Private',
                                desc: lang === 'jv' ? 'Data mboten nate medal saking browser panjenengan. Mboten betah server, mboten betah akun.' : lang === 'id' ? 'Data tidak pernah meninggalkan browsermu. Tidak ada server, tidak ada akun.' : 'Data never leaves your browser. No server, no account required.',
                            },
                            {
                                icon: Zap,
                                color: 'text-amber-500 bg-amber-500/10',
                                title: lang === 'jv' ? 'Super Enggal' : lang === 'id' ? 'Super Cepat' : 'Blazing Fast',
                                desc: lang === 'jv' ? 'Mboten wonten loading saking server. Sedaya cepet, sakwayah-wayah, woten pundi kemawon.' : lang === 'id' ? 'Tidak ada loading dari server. Semua instan, kapan saja, di mana saja.' : 'No server round-trips. Everything is instant, anytime, anywhere.',
                            },
                            {
                                icon: Globe,
                                color: 'text-primary bg-primary/10',
                                title: lang === 'jv' ? 'Tigang Basa' : lang === 'id' ? 'Tiga Bahasa' : 'Trilingual',
                                desc: lang === 'jv' ? 'Wonten Basa Krama (Jawa), Indonesia, lan Inggris. Ganti basa kanthi tombol ing navbar.' : lang === 'id' ? 'Tersedia dalam Bahasa Jawa, Indonesia, dan Inggris. Ganti kapan saja di navbar.' : 'Available in Javanese, Indonesian & English. Switch anytime from the navbar.',
                            },
                        ].map((item, i) => (
                            <div key={i} className="bg-bg-card border border-border/50 rounded-3xl p-7 text-center hover:shadow-md transition-shadow">
                                <div className={`inline-flex p-4 rounded-2xl mb-4 ${item.color}`}>
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-text-main mb-2">{item.title}</h3>
                                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </FadeUp>

            {/* ── CTA BOTTOM ────────────────────────────────────────────────── */}
            <FadeUp>
                <section className="pb-12">
                    <div className="relative bg-gradient-to-br from-primary via-indigo-600 to-secondary rounded-3xl p-12 text-center text-white overflow-hidden shadow-2xl shadow-primary/30">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="relative z-10">
                            <p className="text-white/60 font-bold text-sm uppercase tracking-widest mb-3">ScholarFlow</p>
                            <h2 className="text-4xl font-extrabold mb-4">
                                {lang === 'jv' ? 'Siyaga dados langkung produktif?' : lang === 'id' ? 'Siap untuk lebih produktif?' : 'Ready to be more productive?'}
                            </h2>
                            <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                                {lang === 'jv' ? 'Miwiti sakmenika. Gratis. Saklaminipun.' : lang === 'id' ? 'Mulai sekarang. Gratis. Selamanya.' : 'Start now. Free. Forever.'}
                            </p>
                            <Link
                                to="/tasks"
                                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary rounded-2xl font-black hover:shadow-xl hover:scale-105 transition-all text-lg"
                            >
                                {t('home.cta1')} <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </FadeUp>

            <ScrollToTopBtn />
        </div>
    );
};

export default Home;
