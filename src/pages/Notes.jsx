import { useState } from 'react';
import { useNotes } from '../contexts/NoteContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateId } from '../utils/storage';
import { Plus, Trash2, Edit2, FileText, Calendar, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

const Notes = () => {
    const { notes, addNote, updateNote, deleteNote } = useNotes();
    const { t } = useLanguage();
    const [activeNoteId, setActiveNoteId] = useState(notes.length > 0 ? notes[0].id : null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const activeNote = notes.find((n) => n.id === activeNoteId);

    const handleCreateNote = () => {
        const newNote = {
            id: generateId(),
            title: t('notes.untitled'),
            content: '# New Note\nStart typing your markdown here...',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        addNote(newNote);
        setActiveNoteId(newNote.id);
        setIsEditing(true);
    };

    const handleUpdateNote = (id, updates) => {
        updateNote(id, { ...updates, updatedAt: new Date().toISOString() });
    };

    const filteredNotes = notes
        .filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return (
        <div className="max-w-7xl mx-auto h-[80vh] md:h-[calc(100vh-10rem)] animate-in fade-in duration-500 font-sans flex flex-col md:flex-row gap-6 mb-12">

            {/* Sidebar */}
            <div className="w-full md:w-80 h-[35%] md:h-full shrink-0 bg-bg-card border border-border/50 rounded-3xl p-4 flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        {t('notes.title')}
                    </h2>
                    <button
                        onClick={handleCreateNote}
                        className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors tooltip tooltip-left"
                        title="New Note"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative mb-6">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder={t('notes.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-main border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {filteredNotes.length === 0 ? (
                        <div className="text-center text-text-muted/50 mt-10 italic text-sm">{t('notes.empty')}</div>
                    ) : (
                        filteredNotes.map((note) => (
                            <button
                                key={note.id}
                                onClick={() => { setActiveNoteId(note.id); setIsEditing(false); }}
                                className={`w-full text-left p-4 rounded-2xl transition-all border ${activeNoteId === note.id ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-transparent border-transparent hover:bg-bg-main'}`}
                            >
                                <h3 className="font-semibold truncate text-text-main mb-1">{note.title || t('notes.untitled')}</h3>
                                <div className="flex items-center gap-1 text-xs text-text-muted">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Editor / View Area */}
            <div className="flex-1 bg-bg-card border border-border/50 rounded-3xl p-6 md:p-8 flex flex-col shadow-sm overflow-hidden h-[65%] md:h-full">
                {activeNote ? (
                    <div className="h-full flex flex-col">
                        <div className="flex items-start justify-between mb-8 border-b border-border/50 pb-6">
                            <div className="flex-1 mr-4">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={activeNote.title}
                                        onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                                        className="text-4xl font-extrabold bg-transparent border-none focus:outline-none w-full text-text-main placeholder-text-muted/50"
                                        placeholder={t('notes.untitled')}
                                    />
                                ) : (
                                    <h1 className="text-4xl font-extrabold text-text-main break-words">
                                        {activeNote.title || t('notes.untitled')}
                                    </h1>
                                )}
                                <div className="text-sm text-text-muted mt-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {t('notes.updated')} {format(new Date(activeNote.updatedAt), 'PPp')}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 bg-bg-main p-1.5 rounded-full border border-border/50">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`p-3 rounded-full transition-colors flex items-center gap-2 font-medium text-sm ${isEditing ? 'bg-primary text-white shadow-md' : 'hover:bg-bg-card text-text-muted hover:text-text-main'}`}
                                >
                                    <Edit2 className="w-4 h-4" />
                                    {isEditing ? t('notes.btn.save') : t('notes.btn.edit')}
                                </button>
                                <div className="w-px h-6 bg-border mx-1" />
                                <button
                                    onClick={() => {
                                        deleteNote(activeNote.id);
                                        setActiveNoteId(null);
                                    }}
                                    className="p-3 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                    title="Delete Note"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                            {isEditing ? (
                                <textarea
                                    value={activeNote.content}
                                    onChange={(e) => handleUpdateNote(activeNote.id, { content: e.target.value })}
                                    className="w-full h-full min-h-[400px] bg-transparent resize-none border-none focus:outline-none text-text-main leading-relaxed font-mono text-sm"
                                    placeholder={t('notes.placeholder')}
                                />
                            ) : (
                                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary-hover prose-code:bg-bg-main prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
                                    <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-60">
                        <FileText className="w-24 h-24 mb-6 text-border" />
                        <h3 className="text-2xl font-bold mb-2">{t('notes.noselect.title')}</h3>
                        <p className="text-sm">{t('notes.noselect.desc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
