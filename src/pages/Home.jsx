import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, useInView } from 'framer-motion';
import {
    CheckSquare, Clock, FileText, Calendar, BarChart2,
    ArrowRight, Sparkles, Shield, Zap, Star, ArrowUp
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
                    {/* Glow blob */}
                    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${glow}`} />

                    {badge && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-4">
                            {badge}
                        </span>
                    )}

                    <div className={`inline-flex p-3.5 rounded-2xl mb-5 ${iconBg}`}>
                        <Icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-bold text-text-main mb-2.5 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
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

// ── Pill stat ─────────────────────────────────────────────────────────────────
const PillStat = ({ value, label }) => (
    <div className="flex flex-col items-center px-6 py-4 bg-bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl">
        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">{value}</span>
        <span className="text-xs text-text-muted font-semibold mt-1 text-center">{label}</span>
    </div>
);

// ── How it works step ─────────────────────────────────────────────────────────
const Step = ({ number, title, desc, delay }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay }}
            className="flex gap-5"
        >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/30">
                {number}
            </div>
            <div>
                <h4 className="font-bold text-text-main mb-1">{title}</h4>
                <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
            </div>
        </motion.div>
    );
};

// ── Scroll To Top Button ──────────────────────────────────────────────────────
const ScrollToTopBtn = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 hover:bg-primary-hover hover:scale-110 active:scale-95 transition-all ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
            aria-label="Scroll to top"
        >
            <ArrowUp className="w-6 h-6" />
        </motion.button>
    );
};

// ── Main Landing Page ─────────────────────────────────────────────────────────
const Home = () => {
    const { t, lang } = useLanguage();

    const features = [
        {
            icon: CheckSquare, to: '/tasks',
            glow: 'bg-blue-500', iconBg: 'bg-blue-500/10 text-blue-500',
            badge: 'Eisenhower Matrix',
            title: t('home.feat1.title'),
            desc: t('home.feat1.desc'),
        },
        {
            icon: Clock, to: '/focus',
            glow: 'bg-primary', iconBg: 'bg-primary/10 text-primary',
            badge: 'Pomodoro + Audio',
            title: t('home.feat2.title'),
            desc: t('home.feat2.desc'),
        },
        {
            icon: FileText, to: '/notes',
            glow: 'bg-teal-500', iconBg: 'bg-teal-500/10 text-teal-500',
            badge: 'Markdown',
            title: t('home.feat3.title'),
            desc: t('home.feat3.desc'),
        },
        {
            icon: Calendar, to: '/schedule',
            glow: 'bg-purple-500', iconBg: 'bg-purple-500/10 text-purple-500',
            badge: lang === 'jv' ? 'Minggon' : lang === 'id' ? 'Mingguan' : 'Weekly',
            title: t('home.feat4.title'),
            desc: t('home.feat4.desc'),
        },
        {
            icon: BarChart2, to: '/progress',
            glow: 'bg-green-500', iconBg: 'bg-green-500/10 text-green-500',
            badge: lang === 'jv' ? 'Langsung' : lang === 'id' ? 'Real-time' : 'Real-time',
            title: t('home.feat5.title'),
            desc: t('home.feat5.desc'),
        },
    ];

    return (
        <div className="max-w-6xl mx-auto">

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="relative text-center pt-8 pb-20 overflow-hidden">
                {/* Background glow blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-primary/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 left-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary font-bold text-sm mb-8 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4" />
                        {t('home.badge')}
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-indigo-500 to-secondary">
                            {t('home.title1')}
                        </span>
                        <br />
                        <span className="text-text-main">{t('home.title2')}</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                        {t('home.subtitle')}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
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

                    {/* Stats pills */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <PillStat value="5" label={lang === 'jv' ? 'Pirantos Produktivitas' : lang === 'id' ? 'Alat Produktivitas' : 'Productivity Tools'} />
                        <PillStat value="100%" label={lang === 'jv' ? 'Offline & Pribados' : lang === 'id' ? 'Offline & Privat' : 'Offline & Private'} />
                        <PillStat value="0ms" label={lang === 'jv' ? 'Wekdal Tantu' : lang === 'id' ? 'Waktu Loading' : 'Loading Time'} />
                        <PillStat value="∞" label={lang === 'jv' ? 'Gratis Saklaminipun' : lang === 'id' ? 'Gratis Selamanya' : 'Free Forever'} />
                    </div>
                </motion.div>
            </section>

            {/* ── FEATURES ──────────────────────────────────────────────────── */}
            <section className="pb-20">
                <FadeUp className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold text-xs uppercase tracking-widest mb-4">
                        <Star className="w-3.5 h-3.5" />
                        {lang === 'jv' ? '5 Pirantos Produktivitas' : lang === 'id' ? '5 Fitur Produktivitas' : '5 Productivity Features'}
                    </div>
                    <h2 className="text-4xl font-extrabold text-text-main mb-3">{t('home.features.title')}</h2>
                    <p className="text-text-muted text-lg max-w-xl mx-auto">{t('home.features.subtitle')}</p>
                </FadeUp>

                {/* 3 + 2 grid */}
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

            {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
            <section className="pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <FadeUp>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 font-bold text-xs uppercase tracking-widest mb-6">
                            <Zap className="w-3.5 h-3.5" />
                            {lang === 'jv' ? 'Cara Makarya' : lang === 'id' ? 'Cara Kerja' : 'How It Works'}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-4 leading-tight">
                            {lang === 'jv' ? 'Produktivitas kawiwitan\nsaking lampah alit.' : lang === 'id' ? 'Produktif dimulai dari\nsatu langkah kecil.' : 'Productivity starts\nwith one small step.'}
                        </h2>
                        <p className="text-text-muted leading-relaxed mb-8">
                            {lang === 'jv'
                                ? 'ScholarFlow dipun rancang supados saged dipun angge sakmenika mboten betah daftar, mboten betah backend, mboten betah internet. Data kasimpen aman woten browser.'
                                : lang === 'id'
                                    ? 'ScholarFlow dirancang agar kamu bisa langsung pakai tanpa perlu daftar akun, tanpa backend, tanpa koneksi internet. Data tersimpan aman di browsermu.'
                                    : 'ScholarFlow is designed to be used instantly — no sign-up, no backend, no internet required. Your data stays safely in your browser.'
                            }
                        </p>

                        <div className="space-y-6">
                            <Step number="1" delay={0.1}
                                title={lang === 'jv' ? 'Tambahaken ayahan & tenggat' : lang === 'id' ? 'Tambahkan tugas & deadline' : 'Add tasks & deadlines'}
                                desc={lang === 'jv' ? 'Tata mawi Eisenhower Matrix — menapa ingkang gegancangan, menapa ingkang wigati.' : lang === 'id' ? 'Atur dengan Eisenhower Matrix — apa yang mendesak, apa yang penting.' : 'Organize with Eisenhower Matrix — what\'s urgent, what\'s important.'} />
                            <Step number="2" delay={0.2}
                                title={lang === 'jv' ? 'Fokus kalih Pomodoro' : lang === 'id' ? 'Fokus dengan Pomodoro' : 'Focus with Pomodoro'}
                                desc={lang === 'jv' ? 'Timer 25 menit + swanten ambient generatif. Lacak sesi fokus sedinten panjenengan.' : lang === 'id' ? 'Timer 25 menit + suara ambient generatif. Lacak sesi fokusmu tiap hari.' : '25-minute timer + generative ambient sounds. Track your daily focus sessions.'} />
                            <Step number="3" delay={0.3}
                                title={lang === 'jv' ? 'Lacak progres panjenengan' : lang === 'id' ? 'Lacak progresmu' : 'Track your progress'}
                                desc={lang === 'jv' ? 'Tingali kemajengan 7 dinten kepengker ing grafik ingkang cetha kaliyan motivatif.' : lang === 'id' ? 'Lihat perkembangan 7 hari terakhir dalam grafik yang jelas dan motivatif.' : 'View your last 7 days of progress in clear, motivating charts.'} />
                        </div>
                    </FadeUp>

                    {/* Visual mockup card */}
                    <FadeUp delay={0.15}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl transform translate-x-4 translate-y-4" />
                            <div className="relative bg-bg-card border border-border/60 rounded-3xl p-8 shadow-xl">
                                {/* Mini timer mockup */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                                            {lang === 'jv' ? 'SESI FOKUS' : lang === 'id' ? 'SESI FOKUS' : 'FOCUS SESSION'}
                                        </p>
                                        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
                                            25:00
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-primary/30 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Mini task list mockup */}
                                <div className="space-y-3 mb-6">
                                    {[
                                        { done: true, text: lang === 'jv' ? 'Review materi Algoritma' : lang === 'id' ? 'Review materi Algoritma' : 'Review Algorithm materials', color: 'text-green-500' },
                                        { done: false, text: lang === 'jv' ? 'Rampungaken padamelan basis data' : lang === 'id' ? 'Kerjakan tugas basis data' : 'Complete database assignment', color: 'text-text-main' },
                                        { done: false, text: lang === 'jv' ? 'Tingali jurnal penelitian' : lang === 'id' ? 'Baca jurnal penelitian' : 'Read research journal', color: 'text-text-muted' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-bg-main/50">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500 border-green-500' : 'border-border'}`}>
                                                {item.done && <span className="text-white text-[10px]">✓</span>}
                                            </div>
                                            <span className={`text-sm font-medium ${item.done ? 'line-through text-text-muted/50' : item.color}`}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Mini progress */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-text-muted">{lang === 'jv' ? 'Progres Dintên Mênika' : lang === 'id' ? 'Progres Hari Ini' : "Today's Progress"}</span>
                                        <span className="text-primary">33%</span>
                                    </div>
                                    <div className="h-2 bg-border rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: '33%' }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeUp>
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
                                icon: Star,
                                color: 'text-primary bg-primary/10',
                                title: lang === 'jv' ? 'Tigang Basa' : lang === 'id' ? 'Dua Bahasa' : 'Bilingual',
                                desc: lang === 'jv' ? 'Wonten Basa Krama, Indonesia, lan Inggris. Bisa gantos kapan mawon.' : lang === 'id' ? 'Tampil dalam Bahasa Indonesia dan Inggris. Toggle kapan saja.' : 'Available in Indonesian, English and Javanese. Toggle anytime.',
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
