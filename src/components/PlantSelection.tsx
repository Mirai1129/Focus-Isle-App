import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {plants, useFocus} from '../context/FocusContext';
import {ArrowLeft, ChevronRight, Lock, Sparkles} from 'lucide-react';
import {useTranslation} from 'react-i18next';

const prizeKeys = [
    '5_min_break',
    '10_min_break',
    'coffee_break',
    'snack_time',
    'watch_video',
    'social_media',
    'game_time',
    'pure_focus',
];

const rarityColors = {
    common: '#94a3b8',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
};

export default function PlantSelection() {
    const navigate = useNavigate();
    const {currentSession, setCurrentSession, unlockedPlants} = useFocus();
    const {t} = useTranslation();
    const [selectedPlant, setSelectedPlant] = useState(currentSession?.plant || null);
    const [selectedPrize, setSelectedPrize] = useState(currentSession?.prize || '');

    const handleContinue = () => {
        setCurrentSession({
            ...currentSession,
            plant: selectedPlant!,
            prize: selectedPrize,
        });
        navigate('/whitelist');
    };

    const getRarityText = (rarity: string) => {
        return t(`plants.${rarity}`);
    };

    return (
        <div className="phone-screen">
            <div className="page-header-bar">
                <button className="btn-icon" onClick={() => navigate('/topic')}>
                    <ArrowLeft size={24} strokeWidth={1.5}/>
                </button>
                <h2>{t('focus.select_plant')}</h2>
                <div style={{width: 40}}></div>
            </div>

            <div className="page-content">
                <div className="page-header">
                    <p>{t('plants.title')}</p>
                </div>

                <div className="plant-selection-section">
                    <label className="section-label">
                        <Sparkles size={16} strokeWidth={2}/>
                        {t('focus.available_plants')}
                    </label>
                    <div className="plant-grid">
                        {plants.map((plant) => {
                            const isUnlocked = unlockedPlants.find((p) => p.id === plant.id);
                            const isSelected = selectedPlant?.id === plant.id;

                            return (
                                <button
                                    key={plant.id}
                                    className={`plant-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`}
                                    onClick={() => isUnlocked && setSelectedPlant(plant)}
                                    disabled={!isUnlocked}
                                    style={{'--rarity-color': rarityColors[plant.rarity]} as any}
                                >
                                    <div className="plant-emoji">{isUnlocked ? plant.emoji : '🔒'}</div>
                                    <div className="plant-name">{plant.name}</div>
                                    <div className="plant-time">{plant.growthTime} {t('focus.minutes')}</div>
                                    <div className={`plant-rarity rarity-${plant.rarity}`}>
                                        {getRarityText(plant.rarity)}
                                    </div>
                                    {!isUnlocked && <Lock className="lock-overlay" size={24}/>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="prize-section">
                    <label className="section-label">{t('focus.reward_upon_success')}</label>
                    <div className="prize-list">
                        {prizeKeys.map((prizeKey) => (
                            <button
                                key={prizeKey}
                                className={`prize-option ${selectedPrize === prizeKey ? 'selected' : ''}`}
                                onClick={() => setSelectedPrize(prizeKey)}
                            >
                                <span className="prize-radio"></span>
                                <span>{t(`focus.prizes.${prizeKey}`)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className="btn-primary btn-fixed-bottom"
                    onClick={handleContinue}
                    disabled={!selectedPlant || !selectedPrize}
                >
                    {t('focus.continue')}
                    <ChevronRight size={20} strokeWidth={2}/>
                </button>
            </div>
        </div>
    );
}
