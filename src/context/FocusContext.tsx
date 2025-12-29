import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {supabase} from '../utils/supabase/client';
import {defaultUnlockedPlantIds, defaultWhitelist, PlantConfig, plants} from '../config/plants';

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type Plant = PlantConfig;

export interface FocusSession {
    id: string;
    topic: string;
    category: string;
    plant: Plant;
    prize: string;
    targetDuration: number; // in minutes
    actualDuration: number;
    startTime: Date;
    endTime?: Date;
    success: boolean;
    growthPercentage: number;
}

interface FocusContextType {
    user: { name: string; email: string } | null;
    setUser: (user: { name: string; email: string } | null) => void;
    currentSession: Partial<FocusSession> | null;
    setCurrentSession: (session: Partial<FocusSession> | null) => void;
    sessions: FocusSession[];
    addSession: (session: FocusSession) => void;
    unlockedPlants: Plant[];
    unlockPlant: (plant: Plant) => void;
    whitelist: string[];
    setWhitelist: (apps: string[]) => void;
    reloadUserData: () => Promise<void>;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export {plants};

const defaultUnlockedPlantsState = plants.filter(p => defaultUnlockedPlantIds.includes(p.id));

export function FocusProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [currentSession, setCurrentSession] = useState<Partial<FocusSession> | null>(null);
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [unlockedPlants, setUnlockedPlants] = useState<Plant[]>(defaultUnlockedPlantsState);
    const [whitelist, setWhitelist] = useState<string[]>(defaultWhitelist);

    // Helper function to get fresh access token
    const getFreshToken = async () => {
        try {
            console.log('🔄 Refreshing session...');
            const {data: {session}, error} = await supabase.auth.refreshSession();

            if (error) {
                console.error('❌ Failed to refresh session:', error);
                return null;
            }

            if (session?.access_token) {
                console.log('✅ Session refreshed successfully');
                console.log('New token expires at:', session.expires_at);
                return session.access_token;
            }

            return null;
        } catch (e) {
            console.error('❌ Exception while refreshing:', e);
            return null;
        }
    };

    // Helper function to make authenticated requests with auto-retry
    const authenticatedFetch = async (path: string, options: RequestInit = {}) => {
        const {data: {session}} = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw new Error('No access token available');
        }

        const url = `https://${projectId}.supabase.co/functions/v1${path}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': publicAnonKey,
                },
            });

            if (response.status === 401) {
                console.log('⚠️ Got 401, attempting to refresh token...');
                const freshToken = await getFreshToken();

                if (freshToken) {
                    console.log('🔄 Retrying request with fresh token...');
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers: {
                            'Content-Type': 'application/json',
                            ...options.headers,
                            'Authorization': `Bearer ${freshToken}`,
                            'apikey': publicAnonKey,
                        },
                    });
                    return retryResponse;
                }
            }

            return response;
        } catch (networkError) {
            console.error('❌ Network error during fetch:', networkError);
            console.error('URL:', url);
            throw networkError;
        }
    };

    // Load user data from backend on mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const {data: {session}, error: sessionError} = await supabase.auth.getSession();

                if (sessionError || !session?.access_token) {
                    console.log('No valid session found on mount:', sessionError?.message || 'No session');
                    return;
                }

                console.log('✅ Valid session found on mount, loading user data...');
                console.log('Session user ID:', session.user.id);
                console.log('Token expires at:', session.expires_at);
                console.log('Current time:', Math.floor(Date.now() / 1000));

                const isExpiringSoon = session.expires_at && session.expires_at < (Math.floor(Date.now() / 1000) + 300);
                if (isExpiringSoon) {
                    console.log('⚠️ Token expiring soon, refreshing...');
                    await getFreshToken();
                }

                try {
                    console.log('Fetching profile...');
                    const profileRes = await authenticatedFetch('/make-server-eeff6ec4/profile');

                    if (profileRes.ok) {
                        const {profile} = await profileRes.json();
                        if (profile) {
                            setUser({
                                name: profile.name,
                                email: profile.email,
                            });
                            setUnlockedPlants(plants.filter(p => profile.unlockedPlants?.includes(p.id)));
                            setWhitelist(profile.whitelist || defaultWhitelist);
                            console.log('✅ Profile loaded successfully');
                        }
                    } else {
                        const errorText = await profileRes.text();
                        console.error('❌ Failed to load profile:', profileRes.status, errorText);
                    }

                    console.log('Fetching sessions...');
                    const sessionsRes = await authenticatedFetch(`/make-server-eeff6ec4/sessions/${session.user.id}`);

                    if (sessionsRes.ok) {
                        const {sessions: userSessions} = await sessionsRes.json();
                        if (userSessions && Array.isArray(userSessions)) {
                            const parsedSessions = userSessions.map((s: any) => ({
                                ...s,
                                startTime: new Date(s.startTime),
                                endTime: s.endTime ? new Date(s.endTime) : undefined,
                            }));
                            setSessions(parsedSessions);
                            console.log('✅ Loaded sessions:', parsedSessions.length);
                        }
                    } else {
                        const errorText = await sessionsRes.text();
                        console.error('❌ Failed to load sessions:', sessionsRes.status, errorText);
                    }
                } catch (error) {
                    console.error('❌ Failed to load user data:', error);
                    console.error('Error details:', error instanceof Error ? error.message : String(error));
                }
            } catch (error) {
                console.error('❌ Session error on mount:', error);
                console.error('Error details:', error instanceof Error ? error.message : String(error));
            }
        };

        loadUserData();
    }, []);

    const addSession = async (session: FocusSession) => {
        setSessions((prev) => [session, ...prev]);

        try {
            console.log('=== SAVING SESSION ===');
            console.log('Session ID:', session.id);

            const response = await authenticatedFetch('/make-server-eeff6ec4/sessions', {
                method: 'POST',
                body: JSON.stringify(session),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Session saved successfully to backend:', result);
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to save session to backend:', response.status, errorText);
            }
        } catch (error) {
            console.error('❌ Exception while saving session:', error);
        }
    };

    const unlockPlant = async (plant: Plant) => {
        setUnlockedPlants((prev) => {
            if (prev.find((p) => p.id === plant.id)) return prev;
            const newPlants = [...prev, plant];

            updateProfile({unlockedPlants: newPlants.map(p => p.id)});

            return newPlants;
        });
    };

    const updateProfile = async (updates: any) => {
        try {
            const response = await authenticatedFetch('/make-server-eeff6ec4/profile', {
                method: 'PUT',
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to update profile:', response.status, errorText);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const setWhitelistWithSave = (apps: string[]) => {
        setWhitelist(apps);
        updateProfile({whitelist: apps});
    };

    const reloadUserData = async () => {
        try {
            console.log('🔄 Manually reloading user data...');

            const {data: {session}} = await supabase.auth.getSession();

            if (!session?.access_token) {
                console.log('No session found during reload');
                return;
            }

            console.log('Loading profile...');
            const profileRes = await authenticatedFetch('/make-server-eeff6ec4/profile');

            if (profileRes.ok) {
                const {profile} = await profileRes.json();
                if (profile) {
                    setUser({
                        name: profile.name,
                        email: profile.email,
                    });
                    setUnlockedPlants(plants.filter(p => profile.unlockedPlants?.includes(p.id)));
                    setWhitelist(profile.whitelist || defaultWhitelist);
                    console.log('✅ Profile reloaded');
                }
            } else {
                const errorText = await profileRes.text();
                console.error('❌ Failed to reload profile:', profileRes.status, errorText);
            }

            console.log('Loading sessions...');
            const sessionsRes = await authenticatedFetch(`/make-server-eeff6ec4/sessions/${session.user.id}`);

            if (sessionsRes.ok) {
                const {sessions: userSessions} = await sessionsRes.json();
                if (userSessions && Array.isArray(userSessions)) {
                    const parsedSessions = userSessions.map((s: any) => ({
                        ...s,
                        startTime: new Date(s.startTime),
                        endTime: s.endTime ? new Date(s.endTime) : undefined,
                    }));
                    setSessions(parsedSessions);
                    console.log('✅ Sessions reloaded:', parsedSessions.length);
                }
            } else {
                const errorText = await sessionsRes.text();
                console.error('❌ Failed to reload sessions:', sessionsRes.status, errorText);
            }
        } catch (error) {
            console.error('❌ Failed to reload data:', error);
        }
    };

    return (
        <FocusContext.Provider
            value={{
                user,
                setUser,
                currentSession,
                setCurrentSession,
                sessions,
                addSession,
                unlockedPlants,
                unlockPlant,
                whitelist,
                setWhitelist: setWhitelistWithSave,
                reloadUserData,
            }}
        >
            {children}
        </FocusContext.Provider>
    );
}

export function useFocus() {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
}