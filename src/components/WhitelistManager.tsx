import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useFocus} from '../context/FocusContext';
import {ChevronRight, Plus, X} from 'lucide-react';
import {useTranslation} from 'react-i18next';

const commonApps = [
    'Messages',
    'Phone',
    'Music',
    'Spotify',
    'Calendar',
    'Notes',
    'Clock',
    'Weather',
    'Maps',
    'Podcasts',
];

export default function WhitelistManager() {
    const navigate = useNavigate();
    const {whitelist, setWhitelist} = useFocus();
    const {t} = useTranslation();
    const [selectedApps, setSelectedApps] = useState<string[]>(whitelist);
    const [customApp, setCustomApp] = useState('');

    const toggleApp = (app: string) => {
        setSelectedApps((prev) =>
            prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
        );
    };

    const addCustomApp = () => {
        if (customApp && !selectedApps.includes(customApp)) {
            setSelectedApps([...selectedApps, customApp]);
            setCustomApp('');
        }
    };

    const handleContinue = () => {
        setWhitelist(selectedApps);
        navigate('/focus');
    };

    return (
        <div className="phone-screen">
            <div className="page-content">
                <div className="page-header">
                    <h1>{t('whitelist.title')}</h1>
                    <p>{t('whitelist.description')}</p>
                </div>

                <div className="whitelist-section">
                    <label className="section-label">{t('whitelist.common_apps')}</label>
                    <div className="app-grid">
                        {commonApps.map((app) => (
                            <button
                                key={app}
                                className={`app-chip ${selectedApps.includes(app) ? 'selected' : ''}`}
                                onClick={() => toggleApp(app)}
                            >
                                {app}
                                {selectedApps.includes(app) && (
                                    <X size={16} strokeWidth={2} className="chip-remove"/>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="whitelist-section">
                    <label className="section-label">{t('whitelist.add_custom')}</label>
                    <div className="custom-app-input">
                        <input
                            type="text"
                            placeholder={t('whitelist.add_app')}
                            value={customApp}
                            onChange={(e) => setCustomApp(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCustomApp()}
                        />
                        <button onClick={addCustomApp} className="btn-add" disabled={!customApp}>
                            <Plus size={20} strokeWidth={2}/>
                        </button>
                    </div>
                </div>

                {selectedApps.length > 0 && (
                    <div className="whitelist-section">
                        <label className="section-label">
                            {t('whitelist.selected_apps', {count: selectedApps.length})}
                        </label>
                        <div className="selected-apps-list">
                            {selectedApps.map((app) => (
                                <div key={app} className="selected-app-item">
                                    <span>{app}</span>
                                    <button onClick={() => toggleApp(app)} className="btn-remove">
                                        <X size={16} strokeWidth={2}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button className="btn-primary btn-fixed-bottom" onClick={handleContinue}>
                    {t('focus.start_session')}
                    <ChevronRight size={20} strokeWidth={2}/>
                </button>
            </div>
        </div>
    );
}