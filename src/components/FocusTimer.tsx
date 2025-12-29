import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {plants, useFocus} from '../context/FocusContext';
import {Pause, Play, X} from 'lucide-react';
import {useTranslation} from 'react-i18next';

export default function FocusTimer() {
    const navigate = useNavigate();
    const {currentSession, setCurrentSession, addSession, unlockPlant, sessions} = useFocus();
    const {t} = useTranslation();
    const [timeLeft, setTimeLeft] = useState((currentSession?.targetDuration || 25) * 60);
    const [isPaused, setIsPaused] = useState(false);
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [growth, setGrowth] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    const totalTime = (currentSession?.targetDuration || 25) * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    useEffect(() => {
        if (!currentSession?.plant || !currentSession?.topic) {
            console.log('No valid session found, redirecting to topic setup');
            navigate('/topic', {replace: true});
        } else {
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (!isInitialized || !currentSession?.plant) {
            return;
        }

        let interval: NodeJS.Timeout;
        let hasCompletedRef = false;

        if (!isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1 && !hasCompletedRef) {
                        hasCompletedRef = true;
                        setTimeout(() => handleSuccess(), 0);
                        return 0;
                    }
                    return prev - 1;
                });

                setGrowth((prev) => Math.min(prev + 100 / totalTime, 100));
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isPaused, timeLeft, isInitialized]);

    if (!isInitialized) {
        return null;
    }

    const handleSuccess = () => {
        const session = {
            id: Date.now().toString(),
            topic: currentSession?.topic || '',
            category: currentSession?.category || '',
            plant: currentSession?.plant!,
            prize: currentSession?.prize || '',
            targetDuration: currentSession?.targetDuration || 25,
            actualDuration: currentSession?.targetDuration || 25,
            startTime: new Date(Date.now() - totalTime * 1000),
            endTime: new Date(),
            success: true,
            growthPercentage: 100,
        };

        addSession(session);

        const completedDuration = currentSession?.targetDuration || 25;
        plants.forEach((plant) => {
            if (plant.growthTime <= completedDuration) {
                unlockPlant(plant);
            }
        });

        navigate('/success');
    };

    const handleExit = () => {
        const actualMinutes = Math.floor((totalTime - timeLeft) / 60);
        const session = {
            id: Date.now().toString(),
            topic: currentSession?.topic || '',
            category: currentSession?.category || '',
            plant: currentSession?.plant!,
            prize: currentSession?.prize || '',
            targetDuration: currentSession?.targetDuration || 25,
            actualDuration: actualMinutes,
            startTime: new Date(Date.now() - (totalTime - timeLeft) * 1000),
            endTime: new Date(),
            success: false,
            growthPercentage: growth,
        };

        addSession(session);
        navigate('/failed');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getPlantStage = () => {
        if (growth < 20) return '🌱';
        if (growth < 40) return '🌿';
        if (growth < 60) return '🪴';
        if (growth < 80) return '🌾';
        return currentSession?.plant?.emoji || '🌸';
    };

    return (
        <div className="phone-screen focus-timer-screen">
            <div className="timer-header">
                <button className="btn-icon" onClick={() => setShowExitWarning(true)}>
                    <X size={24} strokeWidth={1.5}/>
                </button>
            </div>

            <div className="timer-content">
                <div className="plant-growth-container">
                    <div className="growth-plant" style={{transform: `scale(${0.5 + growth / 200})`}}>
                        {getPlantStage()}
                    </div>
                    <div className="growth-label">{Math.round(growth)}% {t('timer.growing')}</div>
                </div>

                <div className="timer-display">
                    <div className="timer-ring" style={{'--progress': progress} as any}>
                        <div className="timer-time">{formatTime(timeLeft)}</div>
                    </div>
                </div>

                <div className="timer-info">
                    <h2>{currentSession?.topic}</h2>
                    <p>{t('timer.growing')}: {currentSession?.plant?.name}</p>
                </div>

                <button
                    className="btn-pause"
                    onClick={() => setIsPaused(!isPaused)}
                >
                    {isPaused ? (
                        <>
                            <Play size={24} strokeWidth={2}/>
                            Resume
                        </>
                    ) : (
                        <>
                            <Pause size={24} strokeWidth={2}/>
                            Pause
                        </>
                    )}
                </button>
            </div>

            {showExitWarning && (
                <div className="modal-overlay" onClick={() => setShowExitWarning(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{t('timer.end_early')}</h3>
                        <p>{t('timer.stay_focused')}</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowExitWarning(false)}>
                                {t('focus.continue')}
                            </button>
                            <button className="btn-danger" onClick={handleExit}>
                                {t('timer.give_up')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}