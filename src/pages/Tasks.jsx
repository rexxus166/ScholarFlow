import { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateId } from '../utils/storage';
import { CheckCircle2, Circle, AlertCircle, Clock, Trash2, Plus, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { toast } from 'react-toastify';

const TaskItem = ({ task, onToggle, onDelete, t }) => {
    const x = useMotionValue(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDragEnd = (event, info) => {
        if (info.offset.x < -80) {
            // Swipe ke kiri lebih dari 80px → hapus
            setIsDeleting(true);
            setTimeout(() => {
                onDelete(task.id);
                toast.success(t('tasks.deleteSuccess'));
            }, 300);
        }
    };

    if (isDeleting) {
        return null;
    }

    return (
        <motion.div
            className="relative overflow-hidden"
            initial={{ x: 0 }}
            animate={{ x }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            style={{ x }}
        >
            {/* Background delete button */}
            <motion.div
                className="absolute inset-y-0 right-0 w-24 bg-red-500 rounded-2xl flex items-center justify-center"
                initial={{ opacity: 0 }}
                whileDrag={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.1 } }}
            >
                <Trash2 className="w-5 h-5 text-white" />
            </motion.div>

            {/* Task content */}
            <div className={`flex items-start gap-3 p-3 rounded-2xl hover:bg-bg-main/50 transition-colors group bg-bg-card relative z-10`}>
                <button 
                    onClick={() => onToggle(task.id, !task.completed)} 
                    className="mt-1 flex-shrink-0 text-text-muted hover:text-primary transition-colors"
                    style={{ touchAction: 'none' }}
                >
                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-text-muted/60' : 'text-text-main'}`}>
                    {task.text}
                </span>
                <button 
                    onClick={() => onDelete(task.id)} 
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all flex-shrink-0"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

const Quadrant = ({ title, description, tasks, colorClass, borderClass, icon: Icon, onToggle, onDelete, t }) => (
    <div className={`p-6 rounded-3xl border-2 ${borderClass} bg-bg-card shadow-sm flex flex-col h-[320px] md:h-full`}>
        <div className={`flex items-center gap-2 mb-2 ${colorClass}`}>
            <Icon className="w-6 h-6" />
            <h3 className="text-xl font-bold">{title}</h3>
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

const Tasks = () => {
    const { tasks, addTask, updateTask, deleteTask } = useTasks();
    const { t } = useLanguage();
    const [newTask, setNewTask] = useState('');
    const [isUrgent, setIsUrgent] = useState(true);
    const [isImportant, setIsImportant] = useState(true);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        addTask({
            id: generateId(),
            text: newTask,
            isUrgent,
            isImportant,
            completed: false,
            createdAt: new Date().toISOString()
        });
        setNewTask('');
    };

    const urgentImportant = tasks.filter(t => t.isUrgent && t.isImportant);
    const notUrgentImportant = tasks.filter(t => !t.isUrgent && t.isImportant);
    const urgentNotImportant = tasks.filter(t => t.isUrgent && !t.isImportant);
    const notUrgentNotImportant = tasks.filter(t => !t.isUrgent && !t.isImportant);

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-text-main mb-2">{t('tasks.title')}</h1>
                <p className="text-text-muted">{t('tasks.subtitle')}</p>
            </div>

            <div className="bg-bg-card p-6 rounded-3xl shadow-sm border border-border/50 mb-8">
                <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-4 items-end">
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
                    <div className="flex gap-4 w-full md:w-auto">
                        <label className="flex items-center gap-2 cursor-pointer bg-bg-main px-4 py-3 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors flex-1 md:flex-none justify-center">
                            <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="rounded text-primary focus:ring-primary w-4 h-4 accent-primary" />
                            <span className="text-sm font-medium">{t('tasks.urgent')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-bg-main px-4 py-3 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors flex-1 md:flex-none justify-center">
                            <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} className="rounded text-primary focus:ring-primary w-4 h-4 accent-primary" />
                            <span className="text-sm font-medium">{t('tasks.important')}</span>
                        </label>
                        <button type="submit" className="bg-primary text-white p-3 rounded-2xl hover:bg-primary-hover transition-colors shadow-md flex-shrink-0 flex items-center justify-center w-[50px]">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:h-[600px] mb-12">
                <Quadrant
                    title={t('tasks.q1.title')}
                    description={t('tasks.q1.desc')}
                    icon={AlertCircle}
                    colorClass="text-red-500"
                    borderClass="border-red-500/20 hover:border-red-500/40"
                    tasks={urgentImportant}
                    onToggle={updateTask}
                    onDelete={deleteTask}
                    t={t}
                />
                <Quadrant
                    title={t('tasks.q2.title')}
                    description={t('tasks.q2.desc')}
                    icon={CheckCircle2}
                    colorClass="text-blue-500"
                    borderClass="border-blue-500/20 hover:border-blue-500/40"
                    tasks={notUrgentImportant}
                    onToggle={updateTask}
                    onDelete={deleteTask}
                    t={t}
                />
                <Quadrant
                    title={t('tasks.q3.title')}
                    description={t('tasks.q3.desc')}
                    icon={Clock}
                    colorClass="text-amber-500"
                    borderClass="border-amber-500/20 hover:border-amber-500/40"
                    tasks={urgentNotImportant}
                    onToggle={updateTask}
                    onDelete={deleteTask}
                    t={t}
                />
                <Quadrant
                    title={t('tasks.q4.title')}
                    description={t('tasks.q4.desc')}
                    icon={Trash2}
                    colorClass="text-gray-400"
                    borderClass="border-gray-500/20 hover:border-gray-500/40"
                    tasks={notUrgentNotImportant}
                    onToggle={updateTask}
                    onDelete={deleteTask}
                    t={t}
                />
            </div>
        </div>
    );
};

export default Tasks;
