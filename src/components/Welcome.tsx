
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

export default function Welcome() {
    const navigate = useNavigate();
    const {t} = useTranslation();

    return (
        <div className="phone-screen welcome-screen">
            <div className="welcome-content">
                <div className="welcome-sun">
                    <div className="sun-face">
                        <div className="sun-rays">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="sun-ray" style={{transform: `rotate(${i * 45}deg)`}}/>
                            ))}
                        </div>
                        <div className="sun-circle">
                            <div className="sun-eye left"></div>
                            <div className="sun-eye right"></div>
                            <div className="sun-smile"></div>
                        </div>
                    </div>
                </div>

                <div className="hourglass-container">
                    <div className="hourglass">
                        <div className="hourglass-top">
                            <div className="island-soil"></div>
                            <div className="plant-growing">
                                <div className="plant-stem"></div>
                                <div className="plant-leaf left"></div>
                                <div className="plant-leaf right"></div>
                                <div className="plant-leaf left-2"></div>
                                <div className="plant-leaf right-2"></div>
                            </div>
                        </div>
                        <div className="hourglass-middle"></div>
                        <div className="hourglass-bottom">
                            <div className="sand-pile"></div>
                        </div>
                    </div>
                </div>

                <div className="welcome-text">
                    <h1 className="welcome-title-cn">{t('welcome.title_cn')}</h1>
                    <h2 className="welcome-title-en">{t('welcome.title_en')}</h2>
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