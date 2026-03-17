import { useState } from 'react';
import { useNotes } from '../contexts/NoteContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateId } from '../utils/storage';
import { Plus, FileText, Calendar, Search, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Notes = () => {
    const { notes, addNote, deleteNote } = useNotes();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreateNote = () => {
        const newNote = {
            id: generateId(),
            title: t('notes.default_title'),
            content: t('notes.default_content'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        addNote(newNote);
        navigate(`/notes/${newNote.id}`);
    };

    const filteredNotes = notes
        .filter((n) =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Estimate reading time
    const getReadingTime = (content) => {
        const words = content.trim().split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    };

    // Preview snippet of content (strip markdown symbols)
    const getPreview = (content) => {
        return content
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/`/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .slice(0, 120)
            .trim();
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-sans pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-text-main mb-2">
                        {t('notes.title')}
                    </h1>
                    <p className="text-text-muted">{t('notes.subtitle') || 'Your knowledge base, one note at a time.'}</p>
                </div>

                <button
                    onClick={handleCreateNote}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-bold transition-all shadow-md hover:-translate-y-1 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    {t('notes.tooltip.new')}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    type="text"
                    placeholder={t('notes.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-bg-card border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow shadow-sm"
                />
            </div>

            {/* Notes count */}
            {filteredNotes.length > 0 && (
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-4">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                </p>
            )}

            {/* Notes Grid */}
            {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-text-muted/50">
                    <FileText className="w-20 h-20 mb-6 text-border" />
                    <h3 className="text-2xl font-bold mb-2 text-text-muted">{t('notes.noselect.title')}</h3>
                    <p className="text-sm mb-8">{t('notes.noselect.desc')}</p>
                    <button
                        onClick={handleCreateNote}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-all shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        {t('notes.tooltip.new')}
                    </button>
                </div>
            ) : (
                <AnimatePresence>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredNotes.map((note, i) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25, delay: i * 0.04 }}
                                className="group relative"
                            >
                                {/* Card */}
                                <button
                                    onClick={() => navigate(`/notes/${note.id}`)}
                                    className="w-full text-left bg-bg-card border border-border/50 rounded-3xl p-5 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col gap-3 min-h-[180px] shadow-sm"
                                >
                                    <h3 className="font-extrabold text-text-main text-base leading-snug line-clamp-2">
                                        {note.title || t('notes.untitled')}
                                    </h3>
                                    <p className="text-text-muted text-sm leading-relaxed flex-1 line-clamp-3 opacity-80">
                                        {getPreview(note.content) || '...'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-text-muted/60 pt-2 border-t border-border/30">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(note.updatedAt), 'MMM d')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {getReadingTime(note.content)} min
                                        </span>
                                    </div>
                                </button>

                                {/* Delete button (hover) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNote(note.id);
                                    }}
                                    className="absolute top-3 right-3 p-1.5 opacity-50 hover:opacity-100 transition-all bg-bg-main border border-border/50 text-text-muted hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-90 rounded-xl shadow-sm"
                                    title={t('notes.tooltip.delete')}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        ))}

                        {/* New Note Card */}
                        <motion.button
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: filteredNotes.length * 0.04 }}
                            onClick={handleCreateNote}
                            className="w-full border-2 border-dashed border-border/50 hover:border-primary/40 rounded-3xl p-5 min-h-[180px] flex flex-col items-center justify-center gap-3 text-text-muted hover:text-primary transition-all duration-200 hover:bg-primary/5 group"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-border/40 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold">{t('notes.tooltip.new')}</span>
                        </motion.button>
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default Notes;
