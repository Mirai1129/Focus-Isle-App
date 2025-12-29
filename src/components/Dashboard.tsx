import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useFocus} from '../context/FocusContext';
import {BarChart3, Flower2, History, Play, RefreshCw, Settings, Sparkles} from 'lucide-react';
import {useTranslation} from 'react-i18next';

export default function Dashboard() {
    const navigate = useNavigate();
    const {user, sessions, unlockedPlants, reloadUserData} = useFocus();
    const {t} = useTranslation();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!user) {
            console.log('No user found, redirecting to auth');
            navigate('/auth', {replace: true});
        }
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await reloadUserData();
        setIsRefreshing(false);
    };

    const stats = {
        totalSessions: sessions.length,
        successRate: sessions.length > 0
            ? Math.round((sessions.filter((s) => s.success).length / sessions.length) * 100)
            : 0,
        totalMinutes: sessions.reduce((sum, s) => sum + s.actualDuration, 0),
        plantsUnlocked: unlockedPlants.length,
    };

    const grownPlants = sessions
        .filter((s) => s.success && s.plant)
        .map((s) => ({...s.plant, sessionId: s.id}));

    if (!user) {
        return null;
    }

    return (
        <div className="phone-screen dashboard-screen">
            <div className="dashboard-header">
                <div className="user-greeting">
                    <h1>{t('dashboard.welcome_back', {name: user?.name || 'Islander'})}</h1>
                    <p>{t('dashboard.island_growing')}</p>
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                    <button
                        className="btn-icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        style={{opacity: isRefreshing ? 0.5 : 1}}
                    >
                        <RefreshCw size={24} strokeWidth={1.5} className={isRefreshing ? 'spin' : ''}/>
                    </button>
                    <button className="btn-icon" onClick={() => navigate('/settings')}>
                        <Settings size={24} strokeWidth={1.5}/>
                    </button>
                </div>
            </div>

            <div className="island-preview">
                <div className="island-scene">
                    <div className="island-base"></div>
                    <div className="island-plants">
                        {grownPlants.length > 0 ? (
                            grownPlants.slice(-12).map((plant, i) => {
                                const row = Math.floor(i / 4);
                                const col = i % 4;
                                const leftOffset = 12 + col * 20 + (row % 2 === 1 ? 10 : 0); // Stagger rows
                                const bottomOffset = 10 + row * 18;

                                return (
                                    <span
                                        key={plant.sessionId || `${plant.id}-${i}`}
                                        className="island-plant"
                                        style={{
                                            left: `${leftOffset}%`,
                                            bottom: `${bottomOffset}%`,
                                            animationDelay: `${i * 0.1}s`,
                                            fontSize: row === 2 ? '1.2rem' : row === 1 ? '1.4rem' : '1.6rem',
                                        }}
                                    >
                    {plant.emoji}
                  </span>
                                );
                            })
                        ) : (
                            <span className="island-plant empty-hint" style={{left: '40%'}}>
                🌱
              </span>
                        )}
                    </div>
                    <div className="island-sparkles">
                        <Sparkles className="sparkle" size={20} strokeWidth={1.5}/>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalSessions}</div>
                    <div className="stat-label">{t('dashboard.sessions')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.successRate}%</div>
                    <div className="stat-label">{t('dashboard.success_rate')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalMinutes}</div>
                    <div className="stat-label">{t('dashboard.minutes')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{grownPlants.length}</div>
                    <div className="stat-label">{t('dashboard.plants')}</div>
                </div>
            </div>

            <button
                className="btn-primary btn-start-focus"
                onClick={() => navigate('/topic')}
            >
                <Play size={24} strokeWidth={2}/>
                {t('dashboard.start_focus')}
            </button>

            <div className="nav-grid">
                <button className="nav-card" onClick={() => navigate('/history')}>
                    <History size={28} strokeWidth={1.5}/>
                    <span>{t('dashboard.view_history')}</span>
                </button>
                <button className="nav-card" onClick={() => navigate('/analytics')}>
                    <BarChart3 size={28} strokeWidth={1.5}/>
                    <span>{t('dashboard.analytics')}</span>
                </button>
                <button className="nav-card" onClick={() => navigate('/collection')}>
                    <Flower2 size={28} strokeWidth={1.5}/>
                    <span>{t('dashboard.plant_collection')}</span>
                </button>
            </div>
        </div>
    );
}