import { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState(() => {
        const stored = getStorage('scholarflow_notes', null);
        if (stored && stored.length > 1) return stored;

        return [
            {
                id: 'n1',
                title: '💡 Ide Skripsi: AI & Produktivitas',
                content: '# Konsep Utama\nMembuat aplikasi yang tidak sekadar "To-Do List" biasa.\n\n## Poin-poin:\n- [x] Evaluasi masalah mahasiswa\n- [ ] Cari literatur tentang Pomodoro\n- [ ] Bangun prototipe awal\n\n> "Waktu tidak bisa diubah, tapi produktivitas bisa ditingkatkan."',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'n2',
                title: '📌 Materi Kalkulus Lanjut',
                content: '# Integral Lipat ganda\n\n- Pastikan mengubah batas integral jika menukar urutan integrasi `dx dy` ke `dy dx`.\n- Gunakan koordinat polar apabila bidang lingkar/silinder diputar.',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
    });

    useEffect(() => {
        setStorage('scholarflow_notes', notes);
    }, [notes]);

    const addNote = (note) => setNotes([...notes, note]);
    const updateNote = (id, updates) => setNotes(notes.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    const deleteNote = (id) => setNotes(notes.filter((n) => n.id !== id));

    return (
        <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
            {children}
        </NoteContext.Provider>
    );
};

export const useNotes = () => useContext(NoteContext);
