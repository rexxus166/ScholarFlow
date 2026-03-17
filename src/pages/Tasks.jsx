import { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateId } from '../utils/storage';
import { CheckCircle2, Circle, AlertCircle, Clock, Trash2, Plus, CalendarDays, Archive, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';

// ── Due date badge ─────────────────────────────────────────────────────────────
const DueBadge = ({ dueDate }) => {
    const { t } = useLanguage();
    if (!dueDate) return null;
    const due = new Date(dueDate + 'T23:59:59');
    const today = new Date();
    const diff = differenceInDays(due, today);

    let cls = 'bg-gray-100 text-gray-500 dark:bg-gray-700/50';
    let label = `${t('tasks.due')} ${format(due, 'MMM d')}`;

    if (isPast(due) && !isToday(due)) {
        cls = 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400';
        label = `${t('tasks.overdue')} · ${format(due, 'MMM d')}`;
    } else if (isToday(due)) {
        cls = 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400';
        label = t('tasks.dueToday');
    } else if (diff <= 2) {
        cls = 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400';
        label = `${diff} ${t('tasks.daysLeft')}`;
    }

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${cls}`}>
            <CalendarDays className="w-3 h-3" />
            {label}
        </span>
    );
};

// ── Task item ─────────────────────────────────────────────────────────────────
const TaskItem = ({ task, onToggle, onDelete, t, index }) => {
    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.9 : 1,
                    }}
                    className="mb-3"
                >
                        <div className={`flex items-start gap-3 p-3 rounded-2xl transition-all group relative z-10 ${snapshot.isDragging ? 'bg-bg-card shadow-2xl ring-2 ring-primary border border-transparent scale-105' : 'bg-bg-card border border-border/40 hover:border-border hover:shadow-sm'}`}>
                            <button
                                onClick={() => onToggle(task.id, { completed: !task.completed })}
                                className="mt-1 flex-shrink-0 text-text-muted hover:text-primary transition-colors cursor-pointer"
                                style={{ touchAction: 'none' }}
                            >
                                {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                                <span className={`text-sm block truncate select-none ${task.completed ? 'line-through text-text-muted/60' : 'text-text-main'}`}>
                                    {task.text}
                                </span>
                                {!task.completed && <DueBadge dueDate={task.dueDate} />}
                            </div>
                            <button
                                onClick={() => { onDelete(task.id); toast.success(t('tasks.deleteSuccess')); }}
                                className={`text-text-muted/30 hover:text-red-500 active:text-red-600 active:scale-90 transition-all flex-shrink-0 cursor-pointer p-1 rounded-lg hover:bg-red-500/10 ${snapshot.isDragging ? 'hidden' : ''}`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                </div>
            )}
        </Draggable>
    );
};

// ── Quadrant card ─────────────────────────────────────────────────────────────
const Quadrant = ({ title, description, tasks, colorClass, borderClass, icon: Icon, onToggle, onDelete, t, droppableId }) => (
    <div className={`p-6 rounded-3xl border ${borderClass} shadow-sm flex flex-col h-[320px] md:h-[400px]`}>
        <div className={`flex items-center gap-2 mb-2 ${colorClass}`}>
            <Icon className="w-6 h-6" />
            <h3 className="text-xl font-bold">{title}</h3>
            {tasks.length > 0 && (
                <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded-full ${colorClass} bg-current/10`} style={{ backgroundColor: 'currentColor', color: 'inherit' }}>
                    <span className="mix-blend-multiply dark:mix-blend-screen">{tasks.length}</span>
                </span>
            )}
        </div>
        <p className="text-text-muted text-sm mb-4 min-h-[40px]">{description}</p>

        <Droppable droppableId={droppableId}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto pr-2 custom-scrollbar transition-colors rounded-xl ${snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5 shadow-inner p-2 -mx-2' : ''}`}
                >
                    {tasks.length === 0 && !snapshot.isDraggingOver ? (
                        <div className="text-text-muted/50 text-center py-8 italic font-light text-sm">
                            {t('tasks.empty')}
                        </div>
                    ) : (
                        tasks.map((task, index) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                t={t}
                                index={index}
                            />
                        ))
                    )}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
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

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        const dest = destination.droppableId;
        let isUrgent = false;
        let isImportant = false;

        if (dest === 'q1') { isUrgent = true; isImportant = true; }
        else if (dest === 'q2') { isUrgent = false; isImportant = true; }
        else if (dest === 'q3') { isUrgent = true; isImportant = false; }
        else if (dest === 'q4') { isUrgent = false; isImportant = false; }

        updateTask(draggableId, { isUrgent, isImportant });
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-text-main mb-2">{t('tasks.title')}</h1>
                    <p className="text-text-muted">{t('tasks.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Archive button */}
                    {completedCount > 0 && (
                        <button
                            onClick={() => navigate('/tasks/archive')}
                            className="flex items-center gap-2 bg-bg-card border border-border/50 text-text-muted hover:text-primary hover:border-primary/40 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all shadow-sm"
                        >
                            <Archive className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('tasks.archive.label') || 'Archive'}</span>
                            <span className="bg-green-500/10 text-green-600 text-xs font-black px-1.5 py-0.5 rounded-full">{completedCount}</span>
                        </button>
                    )}

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
            </div>

            {/* Add Task Form */}
            <div className="bg-bg-card p-6 rounded-3xl shadow-sm border border-border/50 mb-6">
                <form onSubmit={handleAddTask}>
                    {/* Task input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder={t('tasks.placeholder')}
                            className="w-full bg-bg-main border border-border/50 rounded-2xl px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        {/* Quadrant selector */}
                        <div className="flex-1 w-full">
                            <p className="text-xs font-semibold text-text-muted mb-2">{t('tasks.quadrant') || 'Category'}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { urgent: true,  important: true,  label: t('tasks.q1.title'), color: 'border-red-300 bg-red-50 text-red-600',     activeRing: 'ring-red-300'    },
                                    { urgent: false, important: true,  label: t('tasks.q2.title'), color: 'border-emerald-300 bg-emerald-50 text-emerald-600',    activeRing: 'ring-emerald-300'   },
                                    { urgent: true,  important: false, label: t('tasks.q3.title'), color: 'border-orange-300 bg-orange-50 text-orange-600', activeRing: 'ring-orange-300'  },
                                    { urgent: false, important: false, label: t('tasks.q4.title'), color: 'border-purple-300 bg-purple-50 text-purple-600',    activeRing: 'ring-purple-300'   },
                                ].map((q) => {
                                    const active = isUrgent === q.urgent && isImportant === q.important;
                                    return (
                                        <button
                                            key={`${q.urgent}-${q.important}`}
                                            type="button"
                                            onClick={() => { setIsUrgent(q.urgent); setIsImportant(q.important); }}
                                            className={`text-left px-3 py-2 rounded-xl border text-xs font-bold transition-all ${q.color} ${active ? `ring-2 ${q.activeRing} scale-[1.03] shadow-sm` : 'opacity-50 hover:opacity-80'}`}
                                        >
                                            {q.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            {/* Due date */}
                            <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                                <p className="text-xs font-semibold text-text-muted">{t('tasks.dueDate')}</p>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="bg-bg-main border border-border/50 rounded-2xl px-3 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm w-full"
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex flex-col justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl hover:bg-primary-hover transition-colors shadow-md font-bold text-sm whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('tasks.add') || 'Add'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>


            {/* Drag hint */}
            <div className="flex items-center justify-center gap-2 text-xs text-text-muted/50 mb-6 select-none">
                <GripVertical className="w-3.5 h-3.5" />
                <span>{t('tasks.dragHint') || 'Drag tasks between quadrants to reprioritize'}</span>
                <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Quadrant Grid */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Quadrant
                        droppableId="q1"
                        title={t('tasks.q1.title')} description={t('tasks.q1.desc')}
                        icon={AlertCircle} colorClass="text-red-500" borderClass="border-red-500/20 hover:border-red-500/40 bg-red-50/30"
                        tasks={urgentImportant} onToggle={updateTask} onDelete={deleteTask} t={t}
                    />
                    <Quadrant
                        droppableId="q2"
                        title={t('tasks.q2.title')} description={t('tasks.q2.desc')}
                        icon={CheckCircle2} colorClass="text-emerald-500" borderClass="border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-50/30"
                        tasks={notUrgentImportant} onToggle={updateTask} onDelete={deleteTask} t={t}
                    />
                    <Quadrant
                        droppableId="q3"
                        title={t('tasks.q3.title')} description={t('tasks.q3.desc')}
                        icon={Clock} colorClass="text-orange-500" borderClass="border-orange-500/20 hover:border-orange-500/40 bg-orange-50/30"
                        tasks={urgentNotImportant} onToggle={updateTask} onDelete={deleteTask} t={t}
                    />
                    <Quadrant
                        droppableId="q4"
                        title={t('tasks.q4.title')} description={t('tasks.q4.desc')}
                        icon={Trash2} colorClass="text-purple-500" borderClass="border-purple-500/20 hover:border-purple-500/40 bg-purple-50/30"
                        tasks={notUrgentNotImportant} onToggle={updateTask} onDelete={deleteTask} t={t}
                    />
                </div>
            </DragDropContext>
        </div>
    );
};

export default Tasks;
