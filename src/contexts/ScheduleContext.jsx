import { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
    const [schedule, setSchedule] = useState(() => {
        const stored = getStorage('scholarflow_schedule', null);
        if (stored && stored.length > 8) return stored; // Trigger regenerasi jika data < 8 (berarti kurang dari dummy)

        return [
            { id: 's1', title: 'Algoritma Pemrograman', day: 'Monday', startTime: '08:00', endTime: '10:00', type: 'class', location: 'Lab Komputer', createdAt: new Date().toISOString() },
            { id: 's2', title: 'Rencana Belajar Pribadi', day: 'Monday', startTime: '19:00', endTime: '21:00', type: 'study', location: '', createdAt: new Date().toISOString() },
            { id: 's3', title: 'Kuis Struktur Data', day: 'Tuesday', startTime: '13:00', endTime: '14:30', type: 'exam', location: 'Gedung A', createdAt: new Date().toISOString() },
            { id: 's4', title: 'Kerja Kelompok Jaringan', day: 'Wednesday', startTime: '15:00', endTime: '17:00', type: 'other', location: 'Perpustakaan', createdAt: new Date().toISOString() },
            { id: 's6', title: 'Kuliah Basis Data', day: 'Thursday', startTime: '09:00', endTime: '11:00', type: 'class', location: 'Ruang 302', createdAt: new Date().toISOString() },
            { id: 's7', title: 'Sesi Bimbingan Skripsi', day: 'Thursday', startTime: '13:00', endTime: '14:00', type: 'study', location: 'Ruang Dosen', createdAt: new Date().toISOString() },
            { id: 's8', title: 'Ujian Tengah Semester', day: 'Thursday', startTime: '15:30', endTime: '17:30', type: 'exam', location: 'Aula Utama', createdAt: new Date().toISOString() },
            { id: 's5', title: 'Review Materi Mingguan', day: 'Friday', startTime: '16:00', endTime: '18:00', type: 'study', location: '', createdAt: new Date().toISOString() }
        ];
    });

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
