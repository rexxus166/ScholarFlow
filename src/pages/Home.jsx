import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 font-sans">
            <div className="inline-block p-1 px-4 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20 backdrop-blur-sm">
                {t('home.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary via-indigo-500 to-secondary mb-6 leading-tight max-w-4xl tracking-tight" dangerouslySetInnerHTML={{ __html: t('home.title1') + '<br />' + t('home.title2') }}>
            </h1>
            <p className="text-xl md:text-2xl text-text-muted max-w-2xl mb-12 font-light">
                {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
                <Link to="/tasks" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1 text-lg w-full sm:w-auto text-center">
                    {t('home.cta1')}
                </Link>
                <Link to="/focus" className="px-8 py-4 bg-bg-card border-2 border-primary text-primary rounded-2xl font-bold hover:bg-primary/5 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 text-lg w-full sm:w-auto text-center">
                    {t('home.cta2')}
                </Link>
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                {[
                    { title: t('home.feat1.title'), desc: t('home.feat1.desc'), icon: "🎯" },
                    { title: t('home.feat2.title'), desc: t('home.feat2.desc'), icon: "🧠" },
                    { title: t('home.feat3.title'), desc: t('home.feat3.desc'), icon: "📝" }
                ].map((feature, idx) => (
                    <div key={idx} className="bg-bg-card p-6 rounded-3xl shadow-sm border border-border/50 hover:shadow-lg transition-all hover:border-primary/30 text-left">
                        <div className="text-4xl mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-bold mb-2 text-text-main">{feature.title}</h3>
                        <p className="text-text-muted">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
