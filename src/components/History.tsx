
import {useNavigate} from 'react-router-dom';
import {useFocus} from '../context/FocusContext';
import {ArrowLeft, CheckCircle2, Clock, XCircle} from 'lucide-react';
import {useTranslation} from 'react-i18next';

export default function History() {
    const navigate = useNavigate();
    const {sessions} = useFocus();
    const {t, i18n} = useTranslation();

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(i18n.language === 'zh-TW' ? 'zh-TW' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    return (
        <div className="phone-screen">
            <div className="page-header-bar">
                <button className="btn-icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} strokeWidth={1.5}/>
                </button>
                <h2>{t('history.title')}</h2>
                <div style={{width: 40}}></div>
            </div>

            <div className="page-content history-content">
                {sessions.length === 0 ? (
                    <div className="empty-state">
                        <Clock size={48} strokeWidth={1.5}/>
                        <h3>{t('history.no_sessions')}</h3>
                        <p>{t('history.start_first')}</p>
                        <button className="btn-primary" onClick={() => navigate('/topic')}>
                            {t('dashboard.start_focus')}
                        </button>
                    </div>
                ) : (
                    <div className="history-list">
                        {sessions.map((session) => (
                            <div key={session.id} className={`history-item ${session.success ? 'success' : 'failed'}`}>
                                <div className="history-icon">
                                    {session.success ? (
                                        <CheckCircle2 size={24} strokeWidth={1.5} className="icon-success"/>
                                    ) : (
                                        <XCircle size={24} strokeWidth={1.5} className="icon-failed"/>
                                    )}
                                </div>

                                <div className="history-content">
                                    <div className="history-header">
                                        <h3>{session.topic}</h3>
                                        <span className="history-plant">{session.plant.emoji}</span>
                                    </div>
                                    <div className="history-meta">
                                        <span className="history-category">{session.category}</span>
                                        <span className="history-duration">
                      {session.actualDuration} / {session.targetDuration} {t('focus.minutes')}
                    </span>
                                    </div>
                                    <div className="history-date">{formatDate(session.startTime)}</div>
                                </div>

                                <div className="history-growth">
                                    <div className="growth-circle"
                                         style={{'--growth': session.growthPercentage} as any}>
                                        {Math.round(session.growthPercentage)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
