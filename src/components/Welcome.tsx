
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

export default function Welcome() {
    const navigate = useNavigate();
    const {t} = useTranslation();

    return (
        <div className="phone-screen welcome-screen">
            <div className="welcome-content">
                <div className="welcome-logo">
                    <img 
                        src="/logo.png" 
                        alt="Focus Isle Logo" 
                        className="logo-image"
                    />
                </div>

                <div className="welcome-text">
                    <p className="welcome-description">
                        {t('welcome.description')}
                    </p>
                </div>

                <button
                    className="btn-primary welcome-btn"
                    onClick={() => navigate('/auth')}
                >
                    {t('welcome.begin')}
                </button>
            </div>
        </div>
    );
}