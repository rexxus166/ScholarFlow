import { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateId } from '../utils/storage';
import { CheckCircle2, Circle, AlertCircle, Clock, Trash2, Plus, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isPast, isToday, differenceInDays } from 'date-fns';

// ── Due date badge ─────────────────────────────────────────────────────────────
const DueBadge = ({ dueDate }) => {
    if (!dueDate) return null;
    const due = new Date(dueDate + 'T23:59:59');
    const today = new Date();
    const diff = differenceInDays(due, today);

    let cls = 'bg-gray-100 text-gray-500 dark:bg-gray-700/50';
    let label = `Due ${format(due, 'MMM d')}`;

    if (isPast(due) && !isToday(due)) {
        cls = 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400';
        label = `Overdue · ${format(due, 'MMM d')}`;
    } else if (isToday(due)) {
        cls = 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400';
        label = 'Due Today!';
    } else if (diff <= 2) {
        cls = 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400';
        label = `${diff}d left`;
    }

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${cls}`}>
            <CalendarDays className="w-3 h-3" />
            {label}
        </span>
    );
};

// ── Task item ─────────────────────────────────────────────────────────────────
const TaskItem = ({ task, onToggle, onDelete, t }) => {
    const x = motion.useMotionValue ? undefined : 0;
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDragEnd = (event, info) => {
        if (info.offset.x < -80) {
            setIsDeleting(true);
            setTimeout(() => {
                onDelete(task.id);
                toast.success(t('tasks.deleteSuccess'));
            }, 300);
        }
    };

    if (isDeleting) return null;

    return (
        <motion.div
            className="relative overflow-hidden"
            initial={{ x: 0 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
        >
            {/* Swipe to delete background */}
            <motion.div
                className="absolute inset-y-0 right-0 w-24 bg-red-500 rounded-2xl flex items-center justify-center"
                initial={{ opacity: 0 }}
                whileDrag={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.1 } }}
            >
                <Trash2 className="w-5 h-5 text-white" />
            </motion.div>

            <div className={`flex items-start gap-3 p-3 rounded-2xl hover:bg-bg-main/50 transition-colors group bg-bg-card relative z-10`}>
                <button
                    onClick={() => onToggle(task.id, { completed: !task.completed })}
                    className="mt-1 flex-shrink-0 text-text-muted hover:text-primary transition-colors"
                    style={{ touchAction: 'none' }}
                >
                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                    <span className={`text-sm block truncate ${task.completed ? 'line-through text-text-muted/60' : 'text-text-main'}`}>
                        {task.text}
                    </span>
                    {!task.completed && <DueBadge dueDate={task.dueDate} />}
                </div>
                <button
                    onClick={() => { onDelete(task.id); toast.success(t('tasks.deleteSuccess')); }}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all flex-shrink-0"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

// ── Quadrant card ─────────────────────────────────────────────────────────────
const Quadrant = ({ title, description, tasks, colorClass, borderClass, icon: Icon, onToggle, onDelete, t }) => (
    <div className={`p-6 rounded-3xl border-2 ${borderClass} bg-bg-card shadow-sm flex flex-col h-[320px] md:h-full`}>
        <div className={`flex items-center gap-2 mb-2 ${colorClass}`}>
            <Icon className="w-6 h-6" />
            <h3 className="text-xl font-bold">{title}</h3>
            {tasks.length > 0 && (
                <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded-full ${colorClass} bg-current/10`} style={{ backgroundColor: 'currentColor', color: 'inherit' }}>
                    <span className="mix-blend-multiply dark:mix-blend-screen">{tasks.length}</span>
                </span>
            )}
        </div>
        <p className="text-text-muted text-sm mb-4">{description}</p>

        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {tasks.length === 0 ? (
                <div className="text-text-muted/50 text-center py-8 italic font-light text-sm">
                    {t('tasks.empty')}
                </div>
            ) : (
                tasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        t={t}
                    />
                ))
            )}
        </div>
    </div>
);

// ── Main Tasks page ───────────────────────────────────────────────────────────
const Tasks = () => {
    const { tasks, addTask, updateTask, deleteTask } = useTasks();
    const { t } = useLanguage();
    const [newTask, setNewTask] = useState('');
    const [isUrgent, setIsUrgent] = useState(true);
    const [isImportant, setIsImportant] = useState(true);
    const [dueDate, setDueDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        addTask({
            id: generateId(),
            text: newTask,
            isUrgent,
            isImportant,
            dueDate: dueDate || null,
            completed: false,
            createdAt: new Date().toISOString()
        });
        setNewTask('');
        setDueDate('');
    };

    const urgentImportant = tasks.filter(t => t.isUrgent && t.isImportant);
    const notUrgentImportant = tasks.filter(t => !t.isUrgent && t.isImportant);
    const urgentNotImportant = tasks.filter(t => t.isUrgent && !t.isImportant);
    const notUrgentNotImportant = tasks.filter(t => !t.isUrgent && !t.isImportant);

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-text-main mb-2">{t('tasks.title')}</h1>
                    <p className="text-text-muted">{t('tasks.subtitle')}</p>
                </div>

                {/* Progress bar mini */}
                {totalCount > 0 && (
                    <div className="flex items-center gap-3 bg-bg-card border border-border/50 rounded-2xl px-4 py-2.5 shadow-sm min-w-[180px]">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-text-muted">{t('tasks.progress')}</span>
                                <span className="text-primary">{completionPct}%</span>
                            </div>
                            <div className="h-2 bg-border rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionPct}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    </div>
                )}
            </div>

            {/* Add Task Form */}
            <div className="bg-bg-card p-6 rounded-3xl shadow-sm border border-border/50 mb-8">
                <form onSubmit={handleAddTask}>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-text-muted mb-2">{t('tasks.new')}</label>
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder={t('tasks.placeholder')}
                                className="w-full bg-bg-main border border-border/50 rounded-2xl px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3 w-full md:w-auto items-end">
                            {/* Due Date */}
                            <div className="flex flex-col gap-1">
                                <label className="block text-xs font-medium text-text-muted">{t('tasks.dueDate')}</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="bg-bg-main border border-border/50 rounded-2xl px-3 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                />
                            </div>
                            {/* Checkboxes */}
                            <label className="flex items-center gap-2 cursor-pointer bg-bg-main px-4 py-3 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors">
                                <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="rounded w-4 h-4 accent-primary" />
                                <span className="text-sm font-medium">{t('tasks.urgent')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-bg-main px-4 py-3 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors">
                                <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} className="rounded w-4 h-4 accent-primary" />
                                <span className="text-sm font-medium">{t('tasks.important')}</span>
                            </label>
                            <button type="submit" className="bg-primary text-white p-3 rounded-2xl hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center w-[50px] h-[50px]">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Quadrant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:h-[600px] mb-12">
                <Quadrant
                    title={t('tasks.q1.title')} description={t('tasks.q1.desc')}
                    icon={AlertCircle} colorClass="text-red-500" borderClass="border-red-500/20 hover:border-red-500/40"
                    tasks={urgentImportant} onToggle={updateTask} onDelete={deleteTask} t={t}
                />
                <Quadrant
                    title={t('tasks.q2.title')} description={t('tasks.q2.desc')}
                    icon={CheckCircle2} colorClass="text-blue-500" borderClass="border-blue-500/20 hover:border-blue-500/40"
                    tasks={notUrgentImportant} onToggle={updateTask} onDelete={deleteTask} t={t}
                />
                <Quadrant
                    title={t('tasks.q3.title')} description={t('tasks.q3.desc')}
                    icon={Clock} colorClass="text-amber-500" borderClass="border-amber-500/20 hover:border-amber-500/40"
                    tasks={urgentNotImportant} onToggle={updateTask} onDelete={deleteTask} t={t}
                />
                <Quadrant
                    title={t('tasks.q4.title')} description={t('tasks.q4.desc')}
                    icon={Trash2} colorClass="text-gray-400" borderClass="border-gray-500/20 hover:border-gray-500/40"
                    tasks={notUrgentNotImportant} onToggle={updateTask} onDelete={deleteTask} t={t}
                />
            </div>
        </div>
    );
};

export default Tasks;
