import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onFinish }) => {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('loading'); // 'loading' | 'done' | 'exit'

    useEffect(() => {
        const duration = 600; // 250 delay + 600 fill + 150 hold + 500 fade = 1500ms total

        const startRAF = () => {
            const start = performance.now();
            const raf = (now) => {
                const elapsed = now - start;
                const pct = Math.min((elapsed / duration) * 100, 100);
                setProgress(pct);

                if (pct < 100) {
                    requestAnimationFrame(raf);
                } else {
                    setPhase('done');
                    setTimeout(() => {
                        setPhase('exit');
                        setTimeout(onFinish, 500); // fade-out 500ms
                    }, 150); // hold sebentar di 100%
                }
            };
            requestAnimationFrame(raf);
        };

        // Sinkron dengan fade-in container (250ms)
        const timer = setTimeout(startRAF, 250);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {phase !== 'exit' && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-main overflow-hidden"
                >
                    {/* Background ambient blobs */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-br from-primary/20 to-secondary/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-0 left-0 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-8">

                        {/* Logo icon */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="relative"
                        >
                            {/* Outer ring pulse */}
                            <motion.div
                                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-secondary opacity-30"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ margin: '-10px', borderRadius: '28px' }}
                            />

                            <div className="w-24 h-24 rounded-3xl bg-bg-card flex items-center justify-center shadow-2xl shadow-primary/40 relative overflow-hidden">
                                {/* Shine effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent z-10"
                                    initial={{ x: '-100%', opacity: 0 }}
                                    animate={{ x: '200%', opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.8, delay: 0.5, ease: 'easeInOut' }}
                                />
                                {/* Logo Image */}
                                <img src="/logo.png" alt="ScholarFlow Logo" className="w-full h-full object-cover" />
                            </div>
                        </motion.div>

                        {/* Brand name */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="text-center"
                        >
                            <h1 className="text-5xl font-black tracking-tight text-text-main mb-2">
                                ScholarFlow
                            </h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="text-text-muted text-sm font-medium tracking-widest uppercase"
                            >
                                Empowering Students
                            </motion.p>
                        </motion.div>

                        {/* Progress bar — container fixed width, hanya opacity yang dianimasikan */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.25 }}
                            className="relative h-1.5 bg-border/50 rounded-full overflow-hidden"
                            style={{ width: '240px' }}
                        >
                            {/* Fill: tumbuh dari kiri ke kanan */}
                            <div
                                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-none"
                                style={{ width: `${progress}%` }}
                            />
                            {/* Shimmer */}
                            <motion.div
                                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                animate={{ x: ['-64px', '240px'] }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.2 }}
                            />
                        </motion.div>

                        {/* Loading label */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 0.6 }}
                            className="text-text-muted text-xs font-semibold tracking-widest uppercase -mt-4"
                        >
                            {phase === 'done' ? '✓ Ready' : `${Math.round(progress)}%`}
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
