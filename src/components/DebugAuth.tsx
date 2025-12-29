import {useEffect, useState} from 'react';
import {supabase} from '../utils/supabase/client';

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

export default function DebugAuth() {
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const info: any = {};

                try {
                    const healthRes = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-eeff6ec4/health`
                    );
                    info.serverReachable = healthRes.ok;
                    info.serverStatus = healthRes.status;
                    if (healthRes.ok) {
                        info.serverResponse = await healthRes.json();
                    } else {
                        info.serverError = await healthRes.text();
                    }
                } catch (e: any) {
                    info.serverReachable = false;
                    info.serverError = e.message;
                }

                const {data: {session}, error} = await supabase.auth.getSession();

                info.hasSession = !!session;
                info.hasAccessToken = !!session?.access_token;
                info.hasUser = !!session?.user;
                info.userId = session?.user?.id;
                info.userEmail = session?.user?.email;
                info.tokenLength = session?.access_token?.length;
                info.authError = error?.message;

                if (session?.access_token) {
                    try {
                        const profileRes = await fetch(
                            `https://${projectId}.supabase.co/functions/v1/make-server-eeff6ec4/profile`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${session.access_token}`,
                                },
                            }
                        );
                        info.profileStatus = profileRes.status;
                        info.profileOk = profileRes.ok;
                        if (profileRes.ok) {
                            info.profileData = await profileRes.json();
                        } else {
                            info.profileError = await profileRes.text();
                        }
                    } catch (e: any) {
                        info.profileException = e.message;
                    }
                }

                setDebugInfo(info);
            } catch (e: any) {
                setDebugInfo({error: e.message});
            }
        };

        checkAuth();
    }, []);

    const migrateData = async () => {
        setIsMigrating(true);
        setMigrationResult(null);

        try {
            const {data: {session}} = await supabase.auth.getSession();

            if (!session?.access_token) {
                setMigrationResult({success: false, message: 'Not logged in'});
                setIsMigrating(false);
                return;
            }

            const res = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-eeff6ec4/migrate-sessions`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                }
            );

            if (res.ok) {
                const data = await res.json();
                setMigrationResult({success: true, ...data});
            } else {
                const errorText = await res.text();
                setMigrationResult({success: false, message: errorText});
            }
        } catch (e: any) {
            setMigrationResult({success: false, message: e.message});
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div style={{padding: '20px', fontFamily: 'monospace', fontSize: '12px', background: '#fff'}}>
            <h2>🔍 Auth Debug Info</h2>
            <pre style={{background: '#f0f0f0', padding: '10px', overflow: 'auto', whiteSpace: 'pre-wrap'}}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
            <div style={{marginTop: '20px'}}>
                <button
                    onClick={() => window.location.reload()}
                    style={{padding: '10px 20px', cursor: 'pointer'}}
                >
                    Refresh
                </button>
            </div>
            <div style={{marginTop: '20px'}}>
                <button
                    onClick={migrateData}
                    style={{padding: '10px 20px', cursor: 'pointer'}}
                    disabled={isMigrating}
                >
                    {isMigrating ? 'Migrating...' : 'Migrate Data'}
                </button>
            </div>
            {migrationResult && (
                <div style={{marginTop: '20px'}}>
                    <h3>Migration Result</h3>
                    <pre style={{background: '#f0f0f0', padding: '10px', overflow: 'auto', whiteSpace: 'pre-wrap'}}>
            {JSON.stringify(migrationResult, null, 2)}
          </pre>
                </div>
            )}
        </div>
    );
}