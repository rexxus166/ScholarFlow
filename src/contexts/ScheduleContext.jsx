import { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
    const [schedule, setSchedule] = useState(() => getStorage('scholarflow_schedule', []));

    useEffect(() => {
        setStorage('scholarflow_schedule', schedule);
    }, [schedule]);

    const addEvent = (event) => setSchedule([...schedule, event]);
    const updateEvent = (id, updates) => setSchedule(schedule.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    const deleteEvent = (id) => setSchedule(schedule.filter((e) => e.id !== id));

    return (
        <ScheduleContext.Provider value={{ schedule, addEvent, updateEvent, deleteEvent }}>
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedule = () => useContext(ScheduleContext);
