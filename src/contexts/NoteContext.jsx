import { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState(() => getStorage('scholarflow_notes', []));

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
