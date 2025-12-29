import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useFocus} from '../context/FocusContext';
import {Leaf, Lock, Mail, User} from 'lucide-react';
import {supabase} from '../utils/supabase/client';
import {useTranslation} from 'react-i18next';

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function LoginRegister() {
    const navigate = useNavigate();
    const {setUser, reloadUserData} = useFocus();
    const {t} = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const {data, error} = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        throw new Error('Invalid email or password. Please check your credentials or sign up for a new account.');
                    }
                    throw error;
                }

                setUser({
                    name: data.user?.user_metadata?.name || formData.email.split('@')[0],
                    email: formData.email,
                });

                await reloadUserData();
                console.log('User data reloaded after login');

                navigate('/dashboard');
            } else {
                const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-eeff6ec4/signup`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${publicAnonKey}`,
                        },
                        body: JSON.stringify({
                            email: formData.email,
                            password: formData.password,
                            name: formData.name,
                        }),
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    if (result.error?.includes('already registered')) {
                        throw new Error('This email is already registered. Please sign in instead.');
                    }
                    throw new Error(result.error || 'Signup failed. Please try again.');
                }

                const {data, error} = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (error) throw error;

                setUser({
                    name: formData.name || formData.email.split('@')[0],
                    email: formData.email,
                });

                await reloadUserData();
                console.log('User data reloaded after signup');

                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="phone-screen auth-screen">
            <div className="auth-content">
                <div className="auth-header">
                    <Leaf className="auth-icon" size={48} strokeWidth={1.5}/>
                    <h1>{isLogin ? t('auth.welcome_back') : t('auth.create_account')}</h1>
                    <p>{t('auth.island_awaits')}</p>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        background: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        textAlign: 'left',
                        lineHeight: '1.5',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label>
                                <User size={20} strokeWidth={1.5}/>
                                <input
                                    type="text"
                                    placeholder={t('auth.your_name')}
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required={!isLogin}
                                    disabled={loading}
                                />
                            </label>
                        </div>
                    )}

                    <div className="form-group">
                        <label>
                            <Mail size={20} strokeWidth={1.5}/>
                            <input
                                type="email"
                                placeholder={t('auth.email')}
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                                disabled={loading}
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label>
                            <Lock size={20} strokeWidth={1.5}/>
                            <input
                                type="password"
                                placeholder={t('auth.password')}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                                disabled={loading}
                            />
                        </label>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading
                            ? (isLogin ? t('auth.signing_in') : t('auth.creating_account'))
                            : (isLogin ? t('auth.sign_in') : t('auth.sign_up'))}
                    </button>
                </form>

                <div className="auth-toggle">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setFormData({name: '', email: '', password: ''});
                        }}
                        className="btn-text"
                        disabled={loading}
                    >
                        {isLogin
                            ? <>{t('auth.no_account')} {t('auth.sign_up')}</>
                            : <>{t('auth.have_account')} {t('auth.sign_in')}</>}
                    </button>
                </div>

                {isLogin && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#f0fdf4',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: '#166534',
                        textAlign: 'center',
                    }}>
                        💡 First time here? Click "Sign up" above to create an account
                    </div>
                )}
            </div>
        </div>
    );
}