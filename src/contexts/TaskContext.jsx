import { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState(() => getStorage('scholarflow_tasks', []));

    useEffect(() => {
        setStorage('scholarflow_tasks', tasks);
    }, [tasks]);

    const addTask = (task) => setTasks([...tasks, task]);
    const updateTask = (id, updates) => setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => useContext(TaskContext);
