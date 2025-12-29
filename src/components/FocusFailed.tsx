import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useFocus} from '../context/FocusContext';
import {Home, RotateCcw} from 'lucide-react';
import {useTranslation} from 'react-i18next';

export default function FocusFailed() {
    const navigate = useNavigate();
    const {currentSession, sessions} = useFocus();
    const {t} = useTranslation();
    const [withering, setWithering] = useState(true);

    const lastSession = sessions[0];

    useEffect(() => {
        const timer = setTimeout(() => setWithering(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="phone-screen failed-screen">
            <div className="failed-content">
                <div className={`failed-animation ${withering ? 'withering' : ''}`}>
                    <div className="failed-plant">
                        {withering ? lastSession?.plant?.emoji : '🥀'}
                    </div>
                </div>

                <div className="failed-text">
                    <h1>{t('failed.session_ended')}</h1>
                    <p>{t('failed.plant_wilted')}</p>
                </div>

                <div className="failed-stats">
                    <div className="failed-stat">
                        <div className="stat-value">{lastSession?.actualDuration || 0}</div>
                        <div className="stat-label">{t('dashboard.minutes')}</div>
                    </div>
                    <div className="failed-stat">
                        <div className="stat-value">{Math.round(lastSession?.growthPercentage || 0)}%</div>
                        <div className="stat-label">{t('timer.growing')}</div>
                    </div>
                    <div className="failed-stat">
                        <div className="stat-value">{lastSession?.targetDuration || 0}</div>
                        <div className="stat-label">{t('focus.duration')}</div>
                    </div>
                </div>

                <div className="encouragement">
                    <p>{t('failed.try_again')}</p>
                </div>

                <div className="failed-actions">
                    <button className="btn-primary" onClick={() => navigate('/topic')}>
                        <RotateCcw size={20} strokeWidth={2}/>
                        {t('failed.try_again_btn')}
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                        <Home size={20} strokeWidth={2}/>
                        {t('failed.back_to_dashboard')}
                    </button>
                </div>
            </div>
        </div>
    );
}
