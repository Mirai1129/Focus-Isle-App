import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useFocus} from '../context/FocusContext';
import {ArrowLeft, BookOpen, Brain, Briefcase, ChevronRight, Heart} from 'lucide-react';
import {useTranslation} from 'react-i18next';

const categories = [
    {id: 'study', name: 'Study', icon: BookOpen, color: '#6366f1'},
    {id: 'work', name: 'Work', icon: Briefcase, color: '#8b5cf6'},
    {id: 'meditation', name: 'Meditation', icon: Brain, color: '#ec4899'},
    {id: 'personal', name: 'Personal', icon: Heart, color: '#f59e0b'},
];

const durations = [15, 25, 30, 45, 60, 90, 120];

export default function FocusTopic() {
    const navigate = useNavigate();
    const {currentSession, setCurrentSession} = useFocus();
    const {t} = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState(currentSession?.category || '');
    const [topic, setTopic] = useState(currentSession?.topic || '');
    const [duration, setDuration] = useState(currentSession?.targetDuration || 25);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customDuration, setCustomDuration] = useState('');

    const handleCustomDurationClick = () => {
        setShowCustomInput(true);
        setDuration(0); // Temporary state to show custom is selected
    };

    const handleCustomDurationChange = (value: string) => {
        setCustomDuration(value);
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 1) {
            setDuration(numValue);
        }
    };

    const isCustomDurationValid = customDuration !== '' && parseInt(customDuration) >= 1;

    const handleContinue = () => {
        setCurrentSession({
            ...currentSession,
            category: selectedCategory,
            topic,
            targetDuration: duration,
        });
        navigate('/plant-selection');
    };

    return (
        <div className="phone-screen">
            <div className="page-header-bar">
                <button className="btn-icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} strokeWidth={1.5}/>
                </button>
                <h2>{t('focus.topic_title')}</h2>
                <div style={{width: 40}}></div>
            </div>

            <div className="page-content">
                <div className="page-header">
                    <p>{t('focus.category')}</p>
                </div>

                <div className="focus-topic-section">
                    <label className="section-label">{t('focus.category')}</label>
                    <div className="category-grid">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    className={`category-card ${selectedCategory === cat.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    style={{'--category-color': cat.color} as any}
                                >
                                    <Icon size={28} strokeWidth={1.5}/>
                                    <span>{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="focus-topic-section">
                    <label className="section-label">{t('focus.topic_or_goal')}</label>
                    <input
                        type="text"
                        className="topic-input"
                        placeholder={t('focus.topic_placeholder')}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>

                <div className="focus-topic-section">
                    <label className="section-label">{t('focus.duration')}</label>
                    <div className="duration-grid">
                        {durations.map((min) => (
                            <button
                                key={min}
                                className={`duration-card ${duration === min && !showCustomInput ? 'selected' : ''}`}
                                onClick={() => {
                                    setDuration(min);
                                    setShowCustomInput(false);
                                    setCustomDuration('');
                                }}
                            >
                                <span className="duration-number">{min}</span>
                                <span className="duration-label">{t('focus.minutes')}</span>
                            </button>
                        ))}
                        <button
                            className={`duration-card duration-card-custom ${showCustomInput ? 'selected' : ''}`}
                            onClick={handleCustomDurationClick}
                        >
                            <span className="duration-number">+</span>
                            <span className="duration-label">custom</span>
                        </button>
                    </div>

                    {showCustomInput && (
                        <div className="custom-duration-input">
                            <input
                                type="number"
                                min="1"
                                placeholder="Enter minutes (min 1)"
                                value={customDuration}
                                onChange={(e) => handleCustomDurationChange(e.target.value)}
                                autoFocus
                            />
                            <span className="custom-duration-unit">{t('focus.minutes')}</span>
                        </div>
                    )}
                </div>

                <button
                    className="btn-primary btn-fixed-bottom"
                    onClick={handleContinue}
                    disabled={!selectedCategory || !topic || duration < 1}
                >
                    {t('focus.continue')}
                    <ChevronRight size={20} strokeWidth={2}/>
                </button>
            </div>
        </div>
    );
}