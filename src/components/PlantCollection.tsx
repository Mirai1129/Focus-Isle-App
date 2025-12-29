
import {useNavigate} from 'react-router-dom';
import {plants, useFocus} from '../context/FocusContext';
import {ArrowLeft, Lock, Sparkles} from 'lucide-react';
import {useTranslation} from 'react-i18next';

const rarityColors = {
    common: '#94a3b8',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
};

export default function PlantCollection() {
    const navigate = useNavigate();
    const {unlockedPlants, sessions} = useFocus();
    const {t} = useTranslation();

    const getPlantStats = (plantId: string) => {
        const plantSessions = sessions.filter((s) => s.plant.id === plantId);
        return {
            total: plantSessions.length,
            successful: plantSessions.filter((s) => s.success).length,
        };
    };

    const getRarityText = (rarity: string) => {
        return t(`plants.${rarity}`);
    };

    return (
        <div className="phone-screen">
            <div className="page-header-bar">
                <button className="btn-icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} strokeWidth={1.5}/>
                </button>
                <h2>{t('plants.title')}</h2>
                <div style={{width: 40}}></div>
            </div>

            <div className="page-content collection-content">
                <div className="collection-header">
                    <Sparkles size={24} strokeWidth={1.5}/>
                    <p>
                        {t('plants.unlocked_of', {count: unlockedPlants.length, total: plants.length})}
                    </p>
                </div>

                <div className="collection-grid">
                    {plants.map((plant) => {
                        const isUnlocked = unlockedPlants.find((p) => p.id === plant.id);
                        const stats = getPlantStats(plant.id);

                        return (
                            <div
                                key={plant.id}
                                className={`collection-card ${!isUnlocked ? 'locked' : ''}`}
                                style={{'--rarity-color': rarityColors[plant.rarity]} as any}
                            >
                                <div className="collection-plant-emoji">
                                    {isUnlocked ? plant.emoji : '🔒'}
                                </div>
                                <h3>{isUnlocked ? plant.name : '???'}</h3>
                                <div className={`collection-rarity rarity-${plant.rarity}`}>
                                    {getRarityText(plant.rarity)}
                                </div>
                                <div className="collection-info">
                                    <span>{plant.growthTime} {t('dashboard.minutes').toLowerCase()}</span>
                                </div>

                                {isUnlocked && stats.total > 0 && (
                                    <div className="collection-stats">
                                        <div className="collection-stat">
                                            <span className="stat-label">{t('plants.grown')}</span>
                                            <span className="stat-value">{stats.successful}</span>
                                        </div>
                                        <div className="collection-stat">
                                            <span className="stat-label">{t('plants.total')}</span>
                                            <span className="stat-value">{stats.total}</span>
                                        </div>
                                    </div>
                                )}

                                {!isUnlocked && (
                                    <div className="collection-locked">
                                        <Lock size={20} strokeWidth={1.5}/>
                                        <span>{t('plants.unlock_hint')}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
