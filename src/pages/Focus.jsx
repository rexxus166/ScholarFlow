import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings2, Flame, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getStorage, setStorage } from '../utils/storage';

const WORK_TIME = 25 * 60;
const REST_TIME = 5 * 60;

// ── Web Audio API Generators ──────────────────────────────────────────────────
function createRainAudio(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1200;
    lowpass.Q.value = 0.5;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 200;

    whiteNoise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    whiteNoise.start();
    return [whiteNoise];
}

function createCafeAudio(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) / 7;
        b6 = white * 0.115926;
    }
    const pink = ctx.createBufferSource();
    pink.buffer = buffer;
    pink.loop = true;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 600;
    bandpass.Q.value = 0.3;
    pink.connect(bandpass);
    bandpass.connect(gainNode);
    pink.start();

    const nodes = [pink];
    function scheduleClick() {
        const delay = 1.5 + Math.random() * 4;
        const osc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        osc.frequency.value = 800 + Math.random() * 400;
        osc.type = 'sine';
        clickGain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
        clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
        osc.connect(clickGain);
        clickGain.connect(gainNode);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
        nodes.push(osc);
    }
    for (let i = 0; i < 6; i++) scheduleClick();
    return nodes;
}

function createLofiAudio(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.98 ? 0.6 : 0.04);
    }
    const crackle = ctx.createBufferSource();
    crackle.buffer = buffer;
    crackle.loop = true;
    const lopass = ctx.createBiquadFilter();
    lopass.type = 'lowpass';
    lopass.frequency.value = 3000;
    crackle.connect(lopass);
    lopass.connect(gainNode);
    crackle.start();

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 55;
    oscGain.gain.value = 0.04;
    osc.connect(oscGain);
    oscGain.connect(gainNode);
    osc.start();
    return [crackle, osc];
}

const GENERATORS = { rain: createRainAudio, cafe: createCafeAudio, lofi: createLofiAudio };

const noises = [
    { id: 'rain', name: 'Rain', emoji: '🌧️', color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/30' },
    { id: 'cafe', name: 'Cafe', emoji: '☕', color: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { id: 'lofi', name: 'Lofi', emoji: '🎵', color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border-purple-500/30' },
    { id: 'none', name: 'None', emoji: '🔇', color: 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-500 border-gray-500/30' },
];

// ── Session dot indicator ─────────────────────────────────────────────────────
const SessionDots = ({ count, goal = 4 }) => (
    <div className="flex items-center gap-1.5 justify-center">
        {Array.from({ length: goal }).map((_, i) => (
            <motion.div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${i < count ? 'bg-primary' : 'bg-border'}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: i === count - 1 ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.4 }}
            />
        ))}
        {count > goal && (
            <span className="text-xs font-bold text-primary ml-1">+{count - goal}</span>
        )}
    </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const Focus = () => {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isWorkMode, setIsWorkMode] = useState(true);
    const [selectedNoise, setSelectedNoise] = useState('none');
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [showComplete, setShowComplete] = useState(false);

    // Session tracking
    const getTodayKey = () => new Date().toISOString().split('T')[0];
    const [sessionData, setSessionData] = useState(() => {
        const saved = getStorage('scholarflow_sessions', {});
        return saved;
    });
    const todaySessions = sessionData[getTodayKey()] || 0;

    const recordSession = () => {
        const today = getTodayKey();
        setSessionData(prev => {
            const updated = { ...prev, [today]: (prev[today] || 0) + 1 };
            setStorage('scholarflow_sessions', updated);
            return updated;
        });
    };

    const audioCtxRef = useRef(null);
    const gainNodeRef = useRef(null);
    const activeNodesRef = useRef([]);

    // ── Timer ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            if (isWorkMode) {
                // Work session complete!
                recordSession();
                setShowComplete(true);
                setTimeout(() => setShowComplete(false), 3000);
            }
            setIsWorkMode(prev => !prev);
            setTimeLeft(isWorkMode ? REST_TIME : WORK_TIME);
            setIsActive(false);
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('ScholarFlow 🎯', {
                    body: isWorkMode ? '🎉 Sesi selesai! Waktunya istirahat.' : '💪 Yuk fokus lagi!',
                });
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, isWorkMode]);

    // ── Audio ──────────────────────────────────────────────────────────────────
    const stopAudio = () => {
        activeNodesRef.current.forEach(node => { try { node.stop?.(); } catch {} });
        activeNodesRef.current = [];
    };

    const startAudio = (noiseId) => {
        stopAudio();
        if (noiseId === 'none' || !GENERATORS[noiseId]) return;
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const gain = audioCtxRef.current.createGain();
            gain.connect(audioCtxRef.current.destination);
            gainNodeRef.current = gain;
        }
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100;
        const nodes = GENERATORS[noiseId](audioCtxRef.current, gainNodeRef.current);
        activeNodesRef.current = nodes;
    };

    const handleNoiseSelect = (id) => {
        setSelectedNoise(id);
        startAudio(id);
    };

    useEffect(() => {
        if (gainNodeRef.current) gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100;
    }, [volume, isMuted]);

    useEffect(() => () => { stopAudio(); audioCtxRef.current?.close(); }, []);

    // ── Controls ───────────────────────────────────────────────────────────────
    const toggleTimer = () => {
        if (!isActive && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setIsActive(prev => !prev);
    };
    const resetTimer = () => { setIsActive(false); setTimeLeft(isWorkMode ? WORK_TIME : REST_TIME); };
    const switchMode = (mode) => { setIsWorkMode(mode === 'work'); setTimeLeft(mode === 'work' ? WORK_TIME : REST_TIME); setIsActive(false); };
    const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    const progressPercentage = ((isWorkMode ? WORK_TIME : REST_TIME) - timeLeft) / (isWorkMode ? WORK_TIME : REST_TIME) * 100;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 font-sans">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3">{t('focus.title')}</h1>
                <p className="text-text-muted text-lg">{t('focus.subtitle')}</p>
            </div>

            {/* Session stats bar */}
            <div className="flex items-center justify-center gap-6 mb-8 bg-bg-card border border-border/50 rounded-2xl px-6 py-3 max-w-sm mx-auto shadow-sm">
                <div className="text-center">
                    <p className="text-2xl font-black text-primary">{todaySessions}</p>
                    <p className="text-xs text-text-muted font-semibold uppercase tracking-wide">{t('focus.sessions.today')}</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <SessionDots count={todaySessions} goal={4} />
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                    <p className="text-2xl font-black text-amber-500">{Math.round(todaySessions * 25)}</p>
                    <p className="text-xs text-text-muted font-semibold uppercase tracking-wide">{t('focus.sessions.mins')}</p>
                </div>
            </div>

            {/* Session complete celebration */}
            <AnimatePresence>
                {showComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="flex items-center justify-center gap-3 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-2xl px-6 py-3 max-w-sm mx-auto mb-6 font-bold text-sm"
                    >
                        <Trophy className="w-5 h-5" />
                        {t('focus.sessions.complete')} #{todaySessions}!
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Timer */}
                <div className="md:col-span-2 bg-bg-card rounded-[3rem] p-10 shadow-sm border border-border/50 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                    <div className="flex gap-4 mb-10 z-10 p-2 bg-bg-main/50 rounded-full border border-border/50 shadow-inner">
                        <button onClick={() => switchMode('work')} className={`px-8 py-3 rounded-full font-bold transition-all ${isWorkMode ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}>
                            {t('focus.btn.focus')}
                        </button>
                        <button onClick={() => switchMode('break')} className={`px-8 py-3 rounded-full font-bold transition-all ${!isWorkMode ? 'bg-secondary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}>
                            {t('focus.btn.break')}
                        </button>
                    </div>

                    <div className="relative w-72 h-72 flex items-center justify-center mb-12 z-10 group cursor-pointer" onClick={toggleTimer}>
                        <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
                            <circle className="text-border/30 stroke-current" strokeWidth="4" cx="50" cy="50" r="48" fill="transparent" />
                            <motion.circle
                                className={`${isWorkMode ? 'text-primary' : 'text-secondary'} stroke-current drop-shadow-md`}
                                strokeWidth="4" strokeLinecap="round" cx="50" cy="50" r="48" fill="transparent"
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
                            {isActive && (
                                <div className="flex gap-1 mt-3">
                                    {[0,1,2].map(i => (
                                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary"
                                            animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-6 z-10">
                        <button onClick={toggleTimer} className={`p-6 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center ${isActive ? 'bg-bg-main text-text-main border-2 border-border' : (isWorkMode ? 'bg-primary text-white' : 'bg-secondary text-white')}`}>
                            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </button>
                        <button onClick={resetTimer} className="p-6 rounded-full bg-bg-main text-text-muted border-2 border-border/50 shadow-sm hover:border-border hover:text-text-main transition-all flex items-center justify-center">
                            <RotateCcw className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* Ambient Noise */}
                <div className="bg-bg-card rounded-[3rem] p-8 shadow-sm border border-border/50 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Settings2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">{t('focus.ambient')}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {noises.map((noise) => (
                                <button key={noise.id} onClick={() => handleNoiseSelect(noise.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${noise.color} ${selectedNoise === noise.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-card shadow-md scale-105' : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'}`}>
                                    <span className="text-2xl">{noise.emoji}</span>
                                    <span className="font-bold text-sm tracking-wide">{noise.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[24px] text-center mb-4">
                            {selectedNoise !== 'none' ? (
                                <p className="text-xs text-green-500/90 font-semibold animate-pulse">
                                    🔊 {t('focus.playing')} {noises.find(n => n.id === selectedNoise)?.name}
                                </p>
                            ) : (
                                <p className="text-xs text-text-muted/50 italic">{t('focus.noSound')}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-bg-main/50 p-6 rounded-3xl border border-border/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">{t('focus.volume')}</span>
                            <button onClick={() => setIsMuted(!isMuted)} className="text-text-muted hover:text-primary transition-colors">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>
                        <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
                            onChange={(e) => { setVolume(parseInt(e.target.value)); if (isMuted && parseInt(e.target.value) > 0) setIsMuted(false); }}
                            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary focus:outline-none" />
                        <div className="flex justify-between text-xs text-text-muted/50 mt-2 font-medium">
                            <span>0%</span><span>{isMuted ? 0 : volume}%</span><span>100%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Focus;
