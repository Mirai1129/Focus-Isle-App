
import {useNavigate} from 'react-router-dom';
import {useFocus} from '../context/FocusContext';
import {Home, RotateCcw, Sparkles} from 'lucide-react';
import {useTranslation} from 'react-i18next';

export default function FocusSuccess() {
    const navigate = useNavigate();
    const {currentSession, sessions} = useFocus();
    const {t} = useTranslation();

    const lastSession = sessions[0];

    return (
        <div className="phone-screen success-screen">
            <div className="success-content">
                <div className="success-animation">
                    <Sparkles className="sparkle-float" size={32} strokeWidth={1.5}/>
                    <div className="success-plant">{lastSession?.plant?.emoji || '🌸'}</div>
                    <Sparkles className="sparkle-float delayed" size={32} strokeWidth={1.5}/>
                </div>

                <div className="success-text">
                    <h1>{t('success.congratulations')}</h1>
                    <p>{t('success.plant_grown', {plant: lastSession?.plant?.name || 'plant'})}</p>
                </div>

                <div className="success-stats">
                    <div className="success-stat">
                        <div className="stat-value">{lastSession?.actualDuration || 0}</div>
                        <div className="stat-label">{t('dashboard.minutes')}</div>
                    </div>
                    <div className="success-stat">
                        <div className="stat-value">100%</div>
                        <div className="stat-label">{t('timer.growing')}</div>
                    </div>
                </div>

                <div className="prize-earned">
                    <h3>🎁 {t('success.session_complete')}</h3>
                    <p>{lastSession?.prize || t('success.congratulations')}</p>
                </div>

                <div className="success-actions">
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                        <Home size={20} strokeWidth={2}/>
                        {t('success.back_to_dashboard')}
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/topic')}>
                        <RotateCcw size={20} strokeWidth={2}/>
                        {t('success.start_another')}
                    </button>
                </div>
            </div>
        </div>
    );
}
