import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '../contexts/NoteContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Edit2, Trash2, Calendar, Clock, BookOpen, Save, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const NoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notes, updateNote, deleteNote } = useNotes();
    const { t } = useLanguage();

    const note = notes.find((n) => String(n.id) === String(id));
    const [isEditing, setIsEditing] = useState(false);

    if (!note) {
        return (
            <div className="max-w-3xl mx-auto py-24 text-center animate-in fade-in duration-500">
                <BookOpen className="w-20 h-20 mx-auto text-border mb-6" />
                <h2 className="text-3xl font-bold text-text-main mb-3">{t('notes.noselect.title')}</h2>
                <p className="text-text-muted mb-8">{t('notes.noselect.desc')}</p>
                <button
                    onClick={() => navigate('/notes')}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-all shadow-md"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('notes.btn.back') || 'Back to Notes'}
                </button>
            </div>
        );
    }

    const handleUpdate = (updates) => {
        updateNote(note.id, { ...updates, updatedAt: new Date().toISOString() });
    };

    const handleDelete = () => {
        deleteNote(note.id);
        navigate('/notes');
    };

    const wordCount = note.content.trim().split(/\s+/).length;
    const readingMins = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-3xl mx-auto pb-24 font-sans"
        >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-10 pt-2">
                <button
                    onClick={() => navigate('/notes')}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-semibold text-sm group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('notes.btn.back') || 'All Notes'}
                </button>

                <div className="flex items-center gap-2">
                    {/* Edit / Preview toggle */}
                    <div className="flex bg-bg-card border border-border/50 rounded-full p-1 shadow-sm">
                        <button
                            onClick={() => setIsEditing(false)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!isEditing ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isEditing ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            {t('notes.btn.edit') || 'Edit'}
                        </button>
                    </div>

                    <button
                        onClick={handleDelete}
                        className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all border border-red-500/20"
                        title={t('notes.tooltip.delete') || 'Delete Note'}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Note Title */}
            <div className="mb-8 border-b border-border/50 pb-8">
                {isEditing ? (
                    <input
                        type="text"
                        value={note.title}
                        onChange={(e) => handleUpdate({ title: e.target.value })}
                        className="w-full text-4xl sm:text-5xl font-extrabold bg-transparent border-none focus:outline-none text-text-main placeholder-text-muted/40 mb-4 leading-tight"
                        placeholder={t('notes.untitled') || 'Untitled'}
                        autoFocus
                    />
                ) : (
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-text-main mb-4 leading-tight break-words">
                        {note.title || t('notes.untitled')}
                    </h1>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        {format(new Date(note.updatedAt), 'PPP')}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary/70" />
                        {readingMins} {t('notes.read.readingTime') || 'min read'}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-primary/70" />
                        {wordCount} words
                    </span>
                </div>
            </div>

            {/* Note Content */}
            <div className="min-h-[50vh]">
                {isEditing ? (
                    <div className="relative">
                        <textarea
                            value={note.content}
                            onChange={(e) => handleUpdate({ content: e.target.value })}
                            className="w-full min-h-[60vh] bg-bg-card border border-border/50 rounded-2xl p-6 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-text-main leading-relaxed font-mono text-sm shadow-sm transition-shadow"
                            placeholder={t('notes.placeholder') || 'Write your markdown here...'}
                        />
                        <div className="flex items-center justify-between mt-3 px-1">
                            <span className="text-xs text-text-muted/60 font-mono">Markdown supported</span>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {t('notes.btn.save') || 'Save & Preview'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-slate dark:prose-invert max-w-none
                        prose-headings:font-extrabold prose-headings:text-text-main
                        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                        prose-p:text-text-main prose-p:leading-relaxed prose-p:text-base
                        prose-a:text-primary hover:prose-a:text-primary-hover prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-text-main prose-strong:font-bold
                        prose-code:bg-bg-card prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-xs prose-code:border prose-code:border-border/50
                        prose-pre:bg-bg-card prose-pre:border prose-pre:border-border/50 prose-pre:rounded-2xl prose-pre:p-5
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:not-italic
                        prose-li:text-text-main prose-li:my-1
                        prose-hr:border-border/50
                        prose-img:rounded-2xl prose-img:shadow-md"
                    >
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Bottom info */}
            <div className="mt-16 pt-8 border-t border-border/50 flex items-center justify-end">
                <span className="text-xs text-text-muted/40">{wordCount} words · {readingMins} min read</span>
            </div>
        </motion.div>
    );
};

export default NoteDetail;
