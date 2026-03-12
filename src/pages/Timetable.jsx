import { useState, useMemo } from 'react';
import { useSchedule } from '../contexts/ScheduleContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateId } from '../utils/storage';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, MapPin, CalendarDays } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Timetable = () => {
    const { schedule, addEvent, updateEvent, deleteEvent } = useSchedule();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const DAYS = [
        { id: 'Monday', label: t('schedule.days.Monday') },
        { id: 'Tuesday', label: t('schedule.days.Tuesday') },
        { id: 'Wednesday', label: t('schedule.days.Wednesday') },
        { id: 'Thursday', label: t('schedule.days.Thursday') },
        { id: 'Friday', label: t('schedule.days.Friday') },
        { id: 'Saturday', label: t('schedule.days.Saturday') },
        { id: 'Sunday', label: t('schedule.days.Sunday') }
    ];

    const TYPES = [
        { id: 'class', label: t('schedule.type.class'), color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
        { id: 'study', label: t('schedule.type.study'), color: 'bg-green-500/20 text-green-600 border-green-500/30' },
        { id: 'exam', label: t('schedule.type.exam'), color: 'bg-red-500/20 text-red-600 border-red-500/30' },
        { id: 'other', label: t('schedule.type.other'), color: 'bg-gray-500/20 text-gray-600 border-gray-500/30' }
    ];

    const [isAdding, setIsAdding] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        day: 'Monday',
        startTime: '08:00',
        endTime: '10:00',
        type: 'class',
        location: ''
    });

    const handleAddEvent = (e) => {
        e.preventDefault();
        if (!newEvent.title.trim() || !newEvent.startTime || !newEvent.endTime) return;

        addEvent({
            id: generateId(),
            ...newEvent,
            createdAt: new Date().toISOString()
        });

        setIsAdding(false);
        setNewEvent(prev => ({ ...prev, title: '', location: '' }));
    };

    const scheduleByDay = useMemo(() => {
        const grouped = DAYS.reduce((acc, day) => {
            acc[day.id] = [];
            return acc;
        }, {});

        schedule.forEach(event => {
            if (grouped[event.day]) {
                grouped[event.day].push(event);
            }
        });

        Object.keys(grouped).forEach(day => {
            grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });

        return grouped;
    }, [schedule, DAYS]);

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        
        if (source.droppableId === destination.droppableId) {
            toast.info(t('schedule.drag.sameDay'));
            return;
        }

        const destDay = destination.droppableId;
        updateEvent(draggableId, { day: destDay });
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500 mb-2">{t('schedule.title')}</h1>
                    <p className="text-text-muted text-lg">{t('schedule.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/schedule/today')}
                        className="flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all shadow-sm bg-bg-card border border-border/50 text-text-muted hover:text-primary hover:border-primary/40 hover:-translate-y-1"
                    >
                        <CalendarDays className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('schedule.today.btn') || "Today"}</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-md ${isAdding ? 'bg-bg-main text-text-main border border-border' : 'bg-primary text-white hover:bg-primary-hover hover:-translate-y-1'}`}
                    >
                        {isAdding ? t('schedule.btn.cancel') : <><Plus className="w-5 h-5" /> {t('schedule.btn.add')}</>}
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="bg-bg-card p-6 rounded-3xl border border-border/50 shadow-lg mb-8 animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-text-muted mb-2">{t('schedule.form.title')}</label>
                            <input
                                type="text"
                                required
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                placeholder={t('schedule.form.title.ph')}
                                className="w-full bg-bg-main border border-border/50 rounded-2xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary/50 transition-all text-sm outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">{t('schedule.form.day')}</label>
                            <select
                                value={newEvent.day}
                                onChange={(e) => setNewEvent({ ...newEvent, day: e.target.value })}
                                className="w-full bg-bg-main border border-border/50 rounded-2xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary/50 transition-all text-sm outline-none appearance-none"
                            >
                                {DAYS.map(day => <option key={day.id} value={day.id}>{day.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">{t('schedule.form.start')}</label>
                            <input
                                type="time"
                                required
                                value={newEvent.startTime}
                                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                className="w-full bg-bg-main border border-border/50 rounded-2xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary/50 transition-all text-sm outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">{t('schedule.form.end')}</label>
                            <input
                                type="time"
                                required
                                value={newEvent.endTime}
                                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                className="w-full bg-bg-main border border-border/50 rounded-2xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary/50 transition-all text-sm outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">{t('schedule.form.type')}</label>
                            <select
                                value={newEvent.type}
                                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                className="w-full bg-bg-main border border-border/50 rounded-2xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary/50 transition-all text-sm outline-none appearance-none"
                            >
                                {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>

                        <div className="lg:col-span-5 hidden lg:block">
                            {/* Spacer for alignment on large screens */}
                        </div>

                        <div className="lg:col-span-1 border-t lg:border-t-0 pt-4 lg:pt-0 mt-2 lg:mt-0 flex flex-col justify-end">
                            <button type="submit" className="w-full bg-primary text-white px-4 py-3 rounded-2xl font-bold shadow-md hover:bg-primary-hover transition-colors text-sm">
                                {t('schedule.form.save')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Timetable Grid */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                    {DAYS.map(day => (
                        <div key={day.id} className="flex flex-col gap-4">
                            <div className="bg-bg-card border-t-4 border-primary p-4 rounded-xl shadow-sm text-center font-bold text-text-main uppercase tracking-widest text-sm">
                                {day.label}
                            </div>

                            <Droppable droppableId={day.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 space-y-3 min-h-[150px] transition-colors rounded-xl ${snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5 shadow-inner p-2 -mx-2' : ''}`}
                                    >
                                        {scheduleByDay[day.id].length === 0 && !snapshot.isDraggingOver ? (
                                            <div className="text-center text-text-muted/40 italic py-6 text-sm border-2 border-dashed border-border/40 rounded-xl">
                                                {t('schedule.free')}
                                            </div>
                                        ) : (
                                            scheduleByDay[day.id].map((event, index) => {
                                                const typeInfo = TYPES.find(t => t.id === event.type) || TYPES[3];
                                                return (
                                                    <Draggable key={event.id} draggableId={String(event.id)} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.9 : 1,
                                                                }}
                                                            >
                                                                <div className={`p-4 rounded-2xl border ${typeInfo.color} relative group overflow-hidden transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary border-transparent scale-105 bg-bg-card' : 'hover:shadow-md'}`}>
                                                                    <button
                                                                        onClick={() => deleteEvent(event.id)}
                                                                        className={`absolute top-2 right-2 p-1.5 transition-opacity bg-bg-card/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white ${snapshot.isDragging ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <h4 className="font-bold text-sm mb-1 pr-6 select-none">{event.title}</h4>
                                                                    <div className="flex items-center gap-1.5 text-xs font-semibold opacity-80 mb-2 select-none">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {event.startTime} - {event.endTime}
                                                                    </div>
                                                                    <div className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider bg-black/5 dark:bg-white/10 select-none">
                                                                        {typeInfo.label}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default Timetable;
