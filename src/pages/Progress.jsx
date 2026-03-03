import { useState, useMemo } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Target, TrendingUp, CheckCircle, Activity } from 'lucide-react';

const Progress = () => {
    const { tasks } = useTasks();
    const [activeTab, setActiveTab] = useState('tasks');

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const urgentImportant = tasks.filter(t => t.isUrgent && t.isImportant).length;

        const byStatus = [
            { name: 'Completed', value: completed, color: '#10b981' }, // green-500
            { name: 'Pending', value: pending, color: '#f59e0b' } // amber-500
        ];

        const byQuadrant = [
            { name: 'Do First', value: urgentImportant, fill: '#ef4444' },
            { name: 'Schedule', value: tasks.filter(t => !t.isUrgent && t.isImportant).length, fill: '#3b82f6' },
            { name: 'Delegate', value: tasks.filter(t => t.isUrgent && !t.isImportant).length, fill: '#f59e0b' },
            { name: 'Eliminate', value: tasks.filter(t => !t.isUrgent && !t.isImportant).length, fill: '#9ca3af' },
        ];

        // Mock progress over last 7 days (ideally this comes from completion history)
        const daysData = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
            // Mock daily completions for visual flair, slightly tied to actual total completed
            const randomCompletions = Math.floor(Math.random() * 5) + (i === 6 ? Math.floor(completed / 2) : 1);
            return {
                name: dateStr,
                tasksDone: randomCompletions,
                studyHours: (Math.random() * 4 + 1).toFixed(1)
            };
        });

        return { total, completed, pending, urgentImportant, byStatus, byQuadrant, daysData };
    }, [tasks]);

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
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500 mb-2">Semester Progress</h1>
                    <p className="text-text-muted text-lg">Visualize your productivity and track your study habits.</p>
                </div>

                <div className="flex bg-bg-card p-1.5 rounded-full border border-border/50 shadow-sm self-start">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Task Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('study')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'study' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Study Hours
                    </button>
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="bg-bg-card border border-border/50 rounded-3xl p-16 text-center shadow-sm">
                    <Activity className="w-20 h-20 text-border mx-auto mb-6 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
                    <p className="text-text-muted">Start adding and completing tasks to see your analytics.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Tasks"
                            value={stats.total}
                            icon={Target}
                            colorClass="bg-blue-500/10 text-blue-500"
                            subtitle="All time created"
                        />
                        <StatCard
                            title="Completed"
                            value={stats.completed}
                            icon={CheckCircle}
                            colorClass="bg-green-500/10 text-green-500"
                            subtitle={`${((stats.completed / (stats.total || 1)) * 100).toFixed(0)}% completion rate`}
                        />
                        <StatCard
                            title="Pending"
                            value={stats.pending}
                            icon={Activity}
                            colorClass="bg-amber-500/10 text-amber-500"
                            subtitle="Tasks waiting to be done"
                        />
                        <StatCard
                            title="Critical Tasks"
                            value={stats.urgentImportant}
                            icon={TrendingUp}
                            colorClass="bg-red-500/10 text-red-500"
                            subtitle="Urgent & Important"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold mb-8">
                                {activeTab === 'tasks' ? 'Daily Tasks Completed (Last 7 Days)' : 'Daily Study Hours (Last 7 Days)'}
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
                            <h3 className="text-xl font-bold mb-8 text-center">Task Distribution</h3>
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
                                    <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Total</span>
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
