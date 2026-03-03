import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const WORK_TIME = 25 * 60;
const REST_TIME = 5 * 60;

const noises = [
    { id: 'rain', name: 'Rain', color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/30' },
    { id: 'cafe', name: 'Cafe', color: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { id: 'lofi', name: 'Lofi', color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border-purple-500/30' },
    { id: 'none', name: 'None', color: 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-500 border-gray-500/30' },
];

const Focus = () => {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isWorkMode, setIsWorkMode] = useState(true);
    const [selectedNoise, setSelectedNoise] = useState('none');
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
        } else if (timeLeft === 0) {
            // Auto switch mode
            setIsWorkMode(!isWorkMode);
            setTimeLeft(isWorkMode ? REST_TIME : WORK_TIME);
            setIsActive(false);
            // Here we would play a notification sound
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, isWorkMode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(isWorkMode ? WORK_TIME : REST_TIME);
    };

    const switchMode = (mode) => {
        setIsWorkMode(mode === 'work');
        setTimeLeft(mode === 'work' ? WORK_TIME : REST_TIME);
        setIsActive(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = ((isWorkMode ? WORK_TIME : REST_TIME) - timeLeft) / (isWorkMode ? WORK_TIME : REST_TIME) * 100;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 font-sans">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3">{t('focus.title')}</h1>
                <p className="text-text-muted text-lg">{t('focus.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Timer Section */}
                <div className="md:col-span-2 bg-bg-card rounded-[3rem] p-10 shadow-sm border border-border/50 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                    <div className="flex gap-4 mb-10 z-10 p-2 bg-bg-main/50 rounded-full border border-border/50 shadow-inner">
                        <button
                            onClick={() => switchMode('work')}
                            className={`px-8 py-3 rounded-full font-bold transition-all ${isWorkMode ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
                        >
                            {t('focus.btn.focus')}
                        </button>
                        <button
                            onClick={() => switchMode('break')}
                            className={`px-8 py-3 rounded-full font-bold transition-all ${!isWorkMode ? 'bg-secondary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
                        >
                            {t('focus.btn.break')}
                        </button>
                    </div>

                    <div className="relative w-72 h-72 flex items-center justify-center mb-12 z-10 group cursor-pointer" onClick={toggleTimer}>
                        <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
                            <circle
                                className="text-border/30 stroke-current"
                                strokeWidth="4"
                                cx="50"
                                cy="50"
                                r="48"
                                fill="transparent"
                            />
                            <motion.circle
                                className={`${isWorkMode ? 'text-primary' : 'text-secondary'} stroke-current drop-shadow-md`}
                                strokeWidth="4"
                                strokeLinecap="round"
                                cx="50"
                                cy="50"
                                r="48"
                                fill="transparent"
                                initial={{ strokeDasharray: "301.59", strokeDashoffset: "0" }}
                                animate={{ strokeDashoffset: 301.59 - (progressPercentage / 100) * 301.59 }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </svg>
                        <div className="flex flex-col items-center justify-center bg-bg-main/80 backdrop-blur-sm rounded-full w-60 h-60 border-[8px] border-bg-card shadow-inner transition-transform group-hover:scale-[1.02]">
                            <span className="text-7xl font-black text-text-main tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatTime(timeLeft)}
                            </span>
                            <span className="text-text-muted font-medium mt-2 uppercase tracking-widest text-sm">
                                {isWorkMode ? t('focus.state.work') : t('focus.state.rest')}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6 z-10">
                        <button
                            onClick={toggleTimer}
                            className={`p-6 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center ${isActive ? 'bg-bg-main text-text-main border-2 border-border' : (isWorkMode ? 'bg-primary text-white' : 'bg-secondary text-white')}`}
                        >
                            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="p-6 rounded-full bg-bg-main text-text-muted border-2 border-border/50 shadow-sm hover:border-border hover:text-text-main transition-all flex items-center justify-center"
                        >
                            <RotateCcw className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* Ambient Noise Section */}
                <div className="bg-bg-card rounded-[3rem] p-8 shadow-sm border border-border/50 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Settings2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">{t('focus.ambient')}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {noises.map((noise) => (
                                <button
                                    key={noise.id}
                                    onClick={() => setSelectedNoise(noise.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${noise.color} ${selectedNoise === noise.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-card shadow-md scale-105' : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'}`}
                                >
                                    <span className="font-bold text-sm tracking-wide">{noise.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-bg-main/50 p-6 rounded-3xl border border-border/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">{t('focus.volume')}</span>
                            <button onClick={() => setIsMuted(!isMuted)} className="text-text-muted hover:text-primary transition-colors">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                                setVolume(parseInt(e.target.value));
                                if (isMuted && parseInt(e.target.value) > 0) setIsMuted(false);
                            }}
                            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
                        />
                        {selectedNoise !== 'none' && (
                            <p className="text-xs text-text-muted/60 mt-4 text-center italic">
                                {t('focus.playing')} {noises.find(n => n.id === selectedNoise)?.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Focus;
