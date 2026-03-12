import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../contexts/TaskContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, CheckCircle2, Trash2, RotateCcw, Archive, CalendarDays, Filter, AlertCircle, Clock, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';

const QUADRANTS = [
    { id: 'all',     label: 'All',           labelId: 'Semua',       color: 'text-text-main',   bg: 'bg-bg-card'          },
    { id: 'q1',      label: 'Urgent & Important',    labelId: 'Mendesak & Penting',  color: 'text-red-500',     bg: 'bg-red-500/10'       },
    { id: 'q2',      label: 'Important',     labelId: 'Penting',     color: 'text-blue-500',    bg: 'bg-blue-500/10'      },
    { id: 'q3',      label: 'Urgent',        labelId: 'Mendesak',    color: 'text-amber-500',   bg: 'bg-amber-500/10'     },
    { id: 'q4',      label: 'Low Priority',  labelId: 'Prioritas Rendah', color: 'text-gray-400', bg: 'bg-gray-500/10'  },
];

const getQuadrant = (task) => {
    if (task.isUrgent && task.isImportant) return 'q1';
    if (!task.isUrgent && task.isImportant) return 'q2';
    if (task.isUrgent && !task.isImportant) return 'q3';
    return 'q4';
};

const QUADRANT_ICONS = {
    q1: AlertCircle,
    q2: Target,
    q3: Clock,
    q4: Archive,
};

const TasksArchive = () => {
    const { tasks, updateTask, deleteTask } = useTasks();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [filterQuadrant, setFilterQuadrant] = useState('all');

    const completedTasks = tasks
        .filter(task => task.completed)
        .filter(task => filterQuadrant === 'all' || getQuadrant(task) === filterQuadrant)
        .sort((a, b) => {
            // Most recently completed first (approximate by id or createdAt)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const totalCompleted = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const pct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-3xl mx-auto pb-24 font-sans"
        >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-10 pt-2">
                <button
                    onClick={() => navigate('/tasks')}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-semibold text-sm group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('tasks.title') || 'Tasks'}
                </button>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted/60 bg-bg-card border border-border/40 px-3 py-1.5 rounded-full">
                    <Archive className="w-3.5 h-3.5" />
                    {t('tasks.archive.label') || 'Archive'}
                </span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400 mb-2">
                    {t('tasks.archive.title') || 'Completed Tasks'}
                </h1>
                <p className="text-text-muted">{t('tasks.archive.subtitle') || 'All the tasks you have finished. Well done!'}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-green-500">{totalCompleted}</p>
                    <p className="text-xs text-text-muted font-semibold mt-1">{t('tasks.archive.stat.done') || 'Completed'}</p>
                </div>
                <div className="bg-bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-text-main">{totalTasks}</p>
                    <p className="text-xs text-text-muted font-semibold mt-1">{t('tasks.archive.stat.total') || 'Total Tasks'}</p>
                </div>
                <div className="bg-bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-primary">{pct}%</p>
                    <p className="text-xs text-text-muted font-semibold mt-1">{t('tasks.archive.stat.rate') || 'Completion Rate'}</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="bg-bg-card border border-border/50 rounded-2xl p-4 mb-8 shadow-sm">
                <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-text-muted">{t('tasks.progress') || 'Progress'}</span>
                    <span className="text-green-500">{pct}%</span>
                </div>
                <div className="h-3 bg-border/50 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    />
                </div>
            </div>

            {/* Filter by quadrant */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <Filter className="w-4 h-4 text-text-muted shrink-0" />
                {QUADRANTS.map(q => (
                    <button
                        key={q.id}
                        onClick={() => setFilterQuadrant(q.id)}
                        className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                            filterQuadrant === q.id
                                ? `${q.bg} ${q.color} border-current shadow-sm`
                                : 'border-border/50 text-text-muted hover:border-border'
                        }`}
                    >
                        {t(`tasks.archive.filter.${q.id}`) || q.label}
                    </button>
                ))}
            </div>

            {/* Task List */}
            {completedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <CheckCircle2 className="w-20 h-20 text-border mb-6" />
                    <h3 className="text-2xl font-bold text-text-main mb-2">
                        {t('tasks.archive.empty.title') || 'No completed tasks yet'}
                    </h3>
                    <p className="text-text-muted text-sm mb-8">
                        {t('tasks.archive.empty.desc') || 'Complete some tasks and they will appear here.'}
                    </p>
                    <button
                        onClick={() => navigate('/tasks')}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-all shadow-md"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('tasks.archive.goBack') || 'Go to Tasks'}
                    </button>
                </div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-3">
                        {completedTasks.map((task, i) => {
                            const quadrant = getQuadrant(task);
                            const Icon = QUADRANT_ICONS[quadrant];
                            const qInfo = QUADRANTS.find(q => q.id === quadrant);

                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 40, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: i * 0.04 }}
                                    className="flex items-center gap-4 bg-bg-card border border-border/50 rounded-2xl p-4 shadow-sm group"
                                >
                                    {/* Quadrant icon */}
                                    <div className={`shrink-0 p-2 rounded-xl ${qInfo?.bg}`}>
                                        <Icon className={`w-4 h-4 ${qInfo?.color}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-text-muted/70 line-through truncate">{task.text}</p>
                                        {task.dueDate && (
                                            <span className="flex items-center gap-1 text-xs text-text-muted/50 mt-0.5">
                                                <CalendarDays className="w-3 h-3" />
                                                {format(new Date(task.dueDate + 'T00:00:00'), 'MMM d, yyyy')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                        {/* Restore */}
                                        <button
                                            onClick={() => updateTask(task.id, { completed: false })}
                                            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                                            title={t('tasks.archive.restore') || 'Restore task'}
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                        {/* Delete permanently */}
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                            title={t('tasks.archive.delete') || 'Delete permanently'}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Done badge */}
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 group-hover:hidden" />
                                </motion.div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            )}
        </motion.div>
    );
};

export default TasksArchive;
