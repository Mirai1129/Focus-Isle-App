
import {useNavigate} from 'react-router-dom';
import {ArrowLeft, Check, Globe, LogOut, User} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {changeLanguage} from '../i18n';
import {supabase} from '../utils/supabase/client';
import {useFocus} from '../context/FocusContext';

const languages = [
    {id: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸'},
    {id: 'zh-TW', name: 'Chinese', nativeName: '繁體中文', flag: '🇹🇼'},
];

export default function Settings() {
    const navigate = useNavigate();
    const {t, i18n} = useTranslation();
    const {user, setUser} = useFocus();

    const handleLanguageChange = (lang: string) => {
        changeLanguage(lang);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        navigate('/');
    };

    return (
        <div className="phone-screen">
            <div className="page-header-bar">
                <button className="btn-icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} strokeWidth={1.5}/>
                </button>
                <h2>{t('settings.title')}</h2>
                <div style={{width: 40}}></div>
            </div>

            <div className="page-content">
                {/* User Profile Section */}
                <div className="settings-profile">
                    <div className="settings-avatar">
                        <User size={32} strokeWidth={1.5}/>
                    </div>
                    <div className="settings-user-info">
                        <h3>{user?.name || 'Islander'}</h3>
                        <p>{user?.email || ''}</p>
                    </div>
                </div>

                {/* Language Section */}
                <div className="settings-section-wrapper">
                    <label className="section-label">
                        <Globe size={16} strokeWidth={2}/>
                        {t('settings.language')}
                    </label>
                    <div className="language-grid">
                        {languages.map((lang) => (
                            <button
                                key={lang.id}
                                className={`language-card ${i18n.language === lang.id ? 'selected' : ''}`}
                                onClick={() => handleLanguageChange(lang.id)}
                            >
                                <div className="language-flag">{lang.flag}</div>
                                <div className="language-info">
                                    <span className="language-native">{lang.nativeName}</span>
                                    <span className="language-name">{lang.name}</span>
                                </div>
                                {i18n.language === lang.id && (
                                    <div className="language-check">
                                        <Check size={18} strokeWidth={2.5}/>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Account Section */}
                <div className="settings-section-wrapper">
                    <label className="section-label">
                        <User size={16} strokeWidth={2}/>
                        {t('common.account')}
                    </label>
                    <div className="settings-section">
                        <button className="settings-item danger" onClick={handleSignOut}>
                            <div className="settings-item-label">
                                <LogOut size={20} strokeWidth={1.5}/>
                                <span>{t('settings.sign_out')}</span>
                            </div>
                            <ArrowLeft size={16} strokeWidth={1.5} style={{transform: 'rotate(180deg)', opacity: 0.5}}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
