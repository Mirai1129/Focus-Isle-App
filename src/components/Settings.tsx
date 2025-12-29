
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

                {/* Footer */}
                <div className="settings-footer">
                    <p className="footer-meta">Copyright © 2025 <a href="https://github.com/Mirai1129" target="_blank" rel="noopener noreferrer" className="author-link">Yu-Chia Ma</a></p>
                    <a 
                        href="https://github.com/Mirai1129/Focus-Isle-App" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="github-link"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>View on GitHub</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
