import { useState, useMemo } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Target, TrendingUp, CheckCircle, Activity } from 'lucide-react';

const Progress = () => {
    const { tasks } = useTasks();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('tasks');

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const urgentImportant = tasks.filter(task => task.isUrgent && task.isImportant).length;

        const byQuadrant = [
            { name: t('tasks.q1.title'), value: tasks.filter(task => task.isUrgent && task.isImportant).length, fill: '#ef4444' },
            { name: t('tasks.q2.title'), value: tasks.filter(task => !task.isUrgent && task.isImportant).length, fill: '#3b82f6' },
            { name: t('tasks.q3.title'), value: tasks.filter(task => task.isUrgent && !task.isImportant).length, fill: '#f59e0b' },
            { name: t('tasks.q4.title'), value: tasks.filter(task => !task.isUrgent && !task.isImportant).length, fill: '#9ca3af' },
        ];

        // Ambil histori nyata dari localStorage
        const rawHistory = JSON.parse(localStorage.getItem('scholarflow_completion_history') || '[]');
        const historyMap = {};
        rawHistory.forEach(h => { historyMap[h.date] = h.count; });

        // Ambil data jadwal untuk hitung jam belajar
        const rawSchedule = JSON.parse(localStorage.getItem('scholarflow_schedule') || '[]');

        // Buat data 7 hari terakhir dari data nyata
        const daysData = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            // Hitung jam belajar dari schedule events berdasarkan hari (Senin/Selasa/dll)
            const weekdayFull = d.toLocaleDateString('en-US', { weekday: 'long' }); // "Monday" dll
            const studyEvents = rawSchedule.filter(
                ev => ev.day === weekdayFull && (ev.type === 'study' || ev.type === 'class')
            );
            const studyHours = studyEvents.reduce((sum, ev) => {
                const [sh, sm] = (ev.startTime || '00:00').split(':').map(Number);
                const [eh, em] = (ev.endTime || '00:00').split(':').map(Number);
                return sum + Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
            }, 0);

            return {
                name: dayName,
                tasksDone: historyMap[dateKey] || 0,
                studyHours: parseFloat(studyHours.toFixed(1))
            };
        });

        return { total, completed, pending, urgentImportant, byQuadrant, daysData };
    }, [tasks, t]);

    const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
        <div className="bg-bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${colorClass}`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-text-muted text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-text-main mb-1">{value}</h3>
                {subtitle && <p className="text-xs text-text-muted/70">{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500 mb-2">{t('progress.title')}</h1>
                    <p className="text-text-muted text-lg">{t('progress.subtitle')}</p>
                </div>

                <div className="flex bg-bg-card p-1.5 rounded-full border border-border/50 shadow-sm self-start">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
                    >
                        {t('progress.tab.tasks')}
                    </button>
                    <button
                        onClick={() => setActiveTab('study')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'study' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
                    >
                        {t('progress.tab.study')}
                    </button>
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="bg-bg-card border border-border/50 rounded-3xl p-16 text-center shadow-sm">
                    <Activity className="w-20 h-20 text-border mx-auto mb-6 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">{t('progress.nodata.title')}</h2>
                    <p className="text-text-muted">{t('progress.nodata.desc')}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title={t('progress.card.total')}
                            value={stats.total}
                            icon={Target}
                            colorClass="bg-blue-500/10 text-blue-500"
                            subtitle={t('progress.card.total.sub')}
                        />
                        <StatCard
                            title={t('progress.card.completed')}
                            value={stats.completed}
                            icon={CheckCircle}
                            colorClass="bg-green-500/10 text-green-500"
                            subtitle={`${((stats.completed / (stats.total || 1)) * 100).toFixed(0)}${t('progress.card.completed.sub')}`}
                        />
                        <StatCard
                            title={t('progress.card.pending')}
                            value={stats.pending}
                            icon={Activity}
                            colorClass="bg-amber-500/10 text-amber-500"
                            subtitle={t('progress.card.pending.sub')}
                        />
                        <StatCard
                            title={t('progress.card.critical')}
                            value={stats.urgentImportant}
                            icon={TrendingUp}
                            colorClass="bg-red-500/10 text-red-500"
                            subtitle={t('progress.card.critical.sub')}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold mb-8">
                                {activeTab === 'tasks' ? t('progress.chart.tasks') : t('progress.chart.study')}
                            </h3>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.daysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'var(--color-bg-main)', opacity: 0.5 }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', background: 'var(--color-bg-card)', color: 'var(--color-text-main)' }}
                                        />
                                        <Bar
                                            dataKey={activeTab === 'tasks' ? 'tasksDone' : 'studyHours'}
                                            fill="var(--color-primary)"
                                            radius={[6, 6, 6, 6]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-bg-card border border-border/50 rounded-3xl p-8 shadow-sm flex flex-col">
                            <h3 className="text-xl font-bold mb-8 text-center">{t('progress.dist.title')}</h3>
                            <div className="flex-1 min-h-[300px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.byQuadrant}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {stats.byQuadrant.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', background: 'var(--color-bg-card)' }}
                                            itemStyle={{ color: 'var(--color-text-main)' }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            formatter={(value) => <span className="text-sm font-medium text-text-muted">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-[36px]">
                                    <span className="text-3xl font-black text-text-main">{stats.total}</span>
                                    <span className="text-xs text-text-muted uppercase font-bold tracking-wider">{t('progress.dist.total')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Progress;
