
import {useNavigate} from 'react-router-dom';
import {useFocus} from '../context/FocusContext';
import {ArrowLeft, Calendar, Target, TrendingUp, Zap} from 'lucide-react';
import {Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis} from 'recharts';
import {useTranslation} from 'react-i18next';

const categoryColors = {
    study: '#6366f1',
    work: '#8b5cf6',
    meditation: '#ec4899',
    personal: '#f59e0b',
};

export default function Analytics() {
    const navigate = useNavigate();
    const {sessions} = useFocus();
    const {t, i18n} = useTranslation();

    const stats = {
        totalTime: sessions.reduce((sum, s) => sum + s.actualDuration, 0),
        successRate: sessions.length > 0
            ? Math.round((sessions.filter((s) => s.success).length / sessions.length) * 100)
            : 0,
        avgSession: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + s.actualDuration, 0) / sessions.length)
            : 0,
        streak: calculateStreak(sessions),
    };

    const categoryData = Object.entries(
        sessions.reduce((acc, s) => {
            acc[s.category] = (acc[s.category] || 0) + s.actualDuration;
            return acc;
        }, {} as Record<string, number>)
    ).map(([category, minutes]) => ({category, minutes}));

    const last7Days = getLast7DaysData(sessions, i18n.language);

    return (
        <div className="phone-screen">
            <div className="page-header-bar">
                <button className="btn-icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} strokeWidth={1.5}/>
                </button>
                <h2>{t('analytics.title')}</h2>
                <div style={{width: 40}}></div>
            </div>

            <div className="page-content analytics-content">
                <div className="analytics-grid">
                    <div className="analytics-card">
                        <TrendingUp className="card-icon" size={24} strokeWidth={1.5}/>
                        <div className="card-value">{stats.totalTime}</div>
                        <div className="card-label">{t('analytics.total_minutes')}</div>
                    </div>
                    <div className="analytics-card">
                        <Target className="card-icon" size={24} strokeWidth={1.5}/>
                        <div className="card-value">{stats.successRate}%</div>
                        <div className="card-label">{t('analytics.success_rate')}</div>
                    </div>
                    <div className="analytics-card">
                        <Zap className="card-icon" size={24} strokeWidth={1.5}/>
                        <div className="card-value">{stats.avgSession}</div>
                        <div className="card-label">{t('analytics.avg_session')}</div>
                    </div>
                    <div className="analytics-card">
                        <Calendar className="card-icon" size={24} strokeWidth={1.5}/>
                        <div className="card-value">{stats.streak}</div>
                        <div className="card-label">{t('analytics.day_streak')}</div>
                    </div>
                </div>

                {sessions.length > 0 && (
                    <>
                        <div className="chart-section">
                            <h3>{t('analytics.last_7_days')}</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={last7Days}>
                                    <XAxis dataKey="day" stroke="#64748b"/>
                                    <YAxis stroke="#64748b"/>
                                    <Bar dataKey="minutes" fill="#6366f1" radius={[8, 8, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {categoryData.length > 0 && (
                            <div className="chart-section">
                                <h3>{t('analytics.time_by_category')}</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="minutes"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={(entry) => entry.category}
                                        >
                                            {categoryData.map((entry) => (
                                                <Cell
                                                    key={entry.category}
                                                    fill={categoryColors[entry.category as keyof typeof categoryColors] || '#64748b'}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </>
                )}

                {sessions.length === 0 && (
                    <div className="empty-state">
                        <TrendingUp size={48} strokeWidth={1.5}/>
                        <h3>{t('analytics.no_data')}</h3>
                        <p>{t('analytics.complete_sessions')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function calculateStreak(sessions: any[]) {
    if (sessions.length === 0) return 0;

    const successfulSessions = sessions.filter((s) => s.success);
    if (successfulSessions.length === 0) return 0;

    const sortedDates = successfulSessions
        .map((s) => new Date(s.startTime).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    let checkDate = new Date();

    for (let i = 0; i < sortedDates.length; i++) {
        if (sortedDates[i] === checkDate.toDateString()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

function getLast7DaysData(sessions: any[], language: string) {
    const data = [];
    const today = new Date();
    const locale = language === 'zh-TW' ? 'zh-TW' : 'en-US';

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        const dayMinutes = sessions
            .filter((s) => new Date(s.startTime).toDateString() === dateStr)
            .reduce((sum, s) => sum + s.actualDuration, 0);

        data.push({
            day: date.toLocaleDateString(locale, {weekday: 'short'}),
            minutes: dayMinutes,
        });
    }

    return data;
}
