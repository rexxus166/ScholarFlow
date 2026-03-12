import { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState(() => {
        const stored = getStorage('scholarflow_tasks', null);
        if (stored && stored.length > 4) return stored; // Trigger regenerasi

        // Dummy data
        const dummy = [
            { id: 't1', text: 'Selesaikan revisi laporan KP', isUrgent: true, isImportant: true, dueDate: new Date().toISOString().split('T')[0], completed: false, createdAt: new Date().toISOString() },
            { id: 't2', text: 'Submit dokumen beasiswa', isUrgent: true, isImportant: true, dueDate: new Date().toISOString().split('T')[0], completed: false, createdAt: new Date().toISOString() },
            { id: 't3', text: 'Diskusi kelompok PBO', isUrgent: false, isImportant: true, dueDate: null, completed: false, createdAt: new Date().toISOString() },
            { id: 't4', text: 'Bayar uang kas lab', isUrgent: true, isImportant: false, dueDate: null, completed: false, createdAt: new Date().toISOString() },
            { id: 't5', text: 'Merapikan folder drive', isUrgent: false, isImportant: false, dueDate: null, completed: false, createdAt: new Date().toISOString() },
        ];
        return dummy;
    });
    const [completionHistory, setCompletionHistory] = useState(() => getStorage('scholarflow_completion_history', []));

    useEffect(() => {
        setStorage('scholarflow_tasks', tasks);
    }, [tasks]);

    useEffect(() => {
        setStorage('scholarflow_completion_history', completionHistory);
    }, [completionHistory]);

    const addTask = (task) => setTasks(prev => [...prev, task]);

    const updateTask = (id, updates) => {
        setTasks(prev => {
            const oldTask = prev.find(t => t.id === id);
            const newTask = { ...oldTask, ...updates };

            // Catat histori hanya saat task baru diselesaikan (bukan di-uncomplete)
            if (!oldTask?.completed && newTask.completed) {
                const today = new Date().toISOString().split('T')[0];
                setCompletionHistory(hist => {
                    const existing = hist.find(h => h.date === today);
                    if (existing) {
                        return hist.map(h => h.date === today ? { ...h, count: h.count + 1 } : h);
                    }
                    return [...hist, { date: today, count: 1 }];
                });
            }

            return prev.map(t => (t.id === id ? newTask : t));
        });
    };

    const deleteTask = (id) => setTasks(prev => prev.filter((t) => t.id !== id));

    // Helper: tasks due today
    const getTasksDueToday = () => {
        const today = new Date().toISOString().split('T')[0];
        return tasks.filter(t => !t.completed && t.dueDate && t.dueDate <= today);
    };

    // Helper: tasks completed today
    const getCompletedToday = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = completionHistory.find(h => h.date === today);
        return todayRecord ? todayRecord.count : 0;
    };

    // Helper: study streak (consecutive days with any completed task)
    const getStudyStreak = () => {
        if (completionHistory.length === 0) return 0;
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split('T')[0];
            if (completionHistory.find(h => h.date === dateKey && h.count > 0)) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            addTask,
            updateTask,
            deleteTask,
            completionHistory,
            getTasksDueToday,
            getCompletedToday,
            getStudyStreak,
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => useContext(TaskContext);
