import { useNavigate } from 'react-router-dom';
import { useSchedule } from '../contexts/ScheduleContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Clock, MapPin, Calendar, CheckCircle2, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const TYPES = [
    { id: 'class',  label: 'Class',    labelId: 'Kuliah',  emoji: '🎓', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30',   dot: 'bg-blue-500'   },
    { id: 'study',  label: 'Study',    labelId: 'Belajar', emoji: '📚', color: 'bg-green-500/15 text-green-600 border-green-500/30', dot: 'bg-green-500'  },
    { id: 'exam',   label: 'Exam',     labelId: 'Ujian',   emoji: '📝', color: 'bg-red-500/15 text-red-600 border-red-500/30',       dot: 'bg-red-500'    },
    { id: 'other',  label: 'Other',    labelId: 'Lainnya', emoji: '📌', color: 'bg-gray-500/15 text-gray-600 border-gray-500/30',   dot: 'bg-gray-400'   },
];

// Detect today's English day name
const getTodayDayName = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Wednesday"
};

// Format 24h time to 12h
const formatTime = (time) => {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

// Check if an event is currently ongoing
const isOngoing = (startTime, endTime) => {
    const now = new Date();
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= startMin && nowMin < endMin;
};

// Check if event is past
const isPast = (endTime) => {
    const now = new Date();
    const [eh, em] = endTime.split(':').map(Number);
    const endMin = eh * 60 + em;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin > endMin;
};

const ScheduleToday = () => {
    const { schedule } = useSchedule();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const today = getTodayDayName(); // "Wednesday" etc.
    const todayLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const todayEvents = schedule
        .filter(e => e.day === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Calculate total study hours today
    const totalMinutes = todayEvents.reduce((acc, e) => {
        const [sh, sm] = e.startTime.split(':').map(Number);
        const [eh, em] = e.endTime.split(':').map(Number);
        return acc + ((eh * 60 + em) - (sh * 60 + sm));
    }, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-2xl mx-auto pb-24 font-sans"
        >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-10 pt-2">
                <button
                    onClick={() => navigate('/schedule')}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-semibold text-sm group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('schedule.title') || 'Schedule'}
                </button>
                <span className="text-xs font-semibold text-text-muted/60 bg-bg-card border border-border/40 px-3 py-1.5 rounded-full">
                    {today}
                </span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-text-main mb-2">
                    {t('schedule.today.title') || "Today's Agenda"}
                </h1>
                <p className="text-text-muted text-base">{todayLabel}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-primary">{todayEvents.length}</p>
                    <p className="text-xs text-text-muted font-semibold mt-1">{t('schedule.today.events') || 'Events'}</p>
                </div>
                <div className="bg-bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-amber-500">{totalHours}</p>
                    <p className="text-xs text-text-muted font-semibold mt-1">{t('schedule.today.hours') || 'Hours'}</p>
                </div>
                <div className="bg-bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-green-500">
                        {todayEvents.filter(e => isPast(e.endTime)).length}
                    </p>
                    <p className="text-xs text-text-muted font-semibold mt-1">{t('schedule.today.done') || 'Done'}</p>
                </div>
            </div>

            {/* Timeline */}
            {todayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-6xl mb-6">☀️</div>
                    <h3 className="text-2xl font-bold text-text-main mb-2">
                        {t('schedule.today.free') || 'Free Day!'}
                    </h3>
                    <p className="text-text-muted text-sm mb-8">
                        {t('schedule.today.freeDesc') || 'No events scheduled for today. Enjoy your rest!'}
                    </p>
                    <button
                        onClick={() => navigate('/schedule')}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-all shadow-md"
                    >
                        <Calendar className="w-4 h-4" />
                        {t('schedule.btn.add') || 'Add Event'}
                    </button>
                </div>
            ) : (
                <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-border/60 rounded-full" />

                    <div className="space-y-5">
                        {todayEvents.map((event, i) => {
                            const typeInfo = TYPES.find(t => t.id === event.type) || TYPES[3];
                            const ongoing = isOngoing(event.startTime, event.endTime);
                            const done = isPast(event.endTime);

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.07 }}
                                    className="flex gap-5 items-start"
                                >
                                    {/* Timeline dot */}
                                    <div className="relative z-10 shrink-0 mt-1">
                                        <div className={`w-[14px] h-[14px] rounded-full border-2 border-bg-main transition-all ${
                                            ongoing ? `${typeInfo.dot} shadow-md ring-4 ring-primary/20 animate-pulse` :
                                            done ? 'bg-green-500' : 'bg-border'
                                        }`} />
                                    </div>

                                    {/* Card */}
                                    <div className={`flex-1 border rounded-2xl p-4 transition-all ${typeInfo.color} ${
                                        ongoing ? 'shadow-md ring-2 ring-primary/20 scale-[1.01]' :
                                        done ? 'opacity-60' : ''
                                    }`}>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{typeInfo.emoji}</span>
                                                <h3 className={`font-bold text-base leading-tight ${done ? 'line-through opacity-60' : ''}`}>
                                                    {event.title}
                                                </h3>
                                            </div>
                                            {ongoing && (
                                                <span className="shrink-0 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                                    Live
                                                </span>
                                            )}
                                            {done && (
                                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold opacity-80">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatTime(event.startTime)} – {formatTime(event.endTime)}
                                            </span>
                                            {event.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {event.location}
                                                </span>
                                            )}
                                            <span className="capitalize px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-black uppercase tracking-wider">
                                                {typeInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-border/50 text-center">
                <span className="text-xs text-text-muted/40">{totalHours}h {t('schedule.today.scheduled') || 'scheduled today'}</span>
            </div>
        </motion.div>
    );
};

export default ScheduleToday;
