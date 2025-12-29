// @ts-nocheck - This is a Deno/Supabase Edge Function file
import {Hono} from 'npm:hono';
import {cors} from 'npm:hono/cors';
import {logger} from 'npm:hono/logger';
import {createClient} from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Configure CORS with explicit settings
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
}));
app.use('*', logger(console.log));

// Service role client for admin operations
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Anon client for validating user JWTs
const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
);

// User signup
app.post('/make-server-eeff6ec4/signup', async (c) => {
    try {
        const {email, password, name} = await c.req.json();

        const {data, error} = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            user_metadata: {name},
            email_confirm: true, // Auto-confirm since email server isn't configured
        });

        if (error) {
            console.log(`Signup error: ${error.message}`);
            return c.json({error: error.message}, 400);
        }

        // Initialize user profile in KV store
        const profileKey = `profile:${data.user.id}`;
        const initialProfile = {
            userId: data.user.id,
            email: data.user.email,
            name: name,
            unlockedPlants: ['1', '2'],
            whitelist: ['Messages', 'Phone', 'Music'],
        };

        await kv.set(profileKey, initialProfile);
        console.log(`✅ Created profile for user ${data.user.id}`);

        return c.json({user: data.user});
    } catch (error) {
        console.log(`Signup exception: ${error}`);
        return c.json({error: 'Signup failed'}, 500);
    }
});

// Get user sessions
app.get('/make-server-eeff6ec4/sessions/:userId', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        console.log('Get sessions - Auth header present:', !!authHeader);

        const accessToken = authHeader?.split(' ')[1];

        if (!accessToken) {
            console.log('No access token provided');
            return c.json({error: 'Unauthorized - No token'}, 401);
        }

        console.log('Validating token for get sessions...');
        const {data: {user}, error: authError} = await supabaseAnon.auth.getUser(accessToken);

        if (authError) {
            console.log(`Get sessions auth error: ${authError.message}, Status: ${authError.status}`);
            console.log('Full auth error:', JSON.stringify(authError));
            return c.json({error: 'Unauthorized'}, 401);
        }

        if (!user) {
            console.log('No user found from token');
            return c.json({error: 'Unauthorized - No user'}, 401);
        }

        const userId = c.req.param('userId');
        console.log(`✅ Token validated. Fetching sessions for user: ${userId}`);

        // Use single key for all sessions
        const sessionsKey = `sessions:${userId}`;
        const sessionsData = await kv.get(sessionsKey);
        const sessions = sessionsData || [];

        console.log(`Found ${sessions?.length || 0} sessions for user ${userId}`);

        return c.json({sessions});
    } catch (error) {
        console.log(`Get sessions exception: ${error}`);
        return c.json({error: 'Failed to fetch sessions'}, 500);
    }
});

// Save a focus session
app.post('/make-server-eeff6ec4/sessions', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        console.log('=== SAVE SESSION DEBUG ===');
        console.log('Save session - Auth header present:', !!authHeader);
        console.log('Auth header value:', authHeader);

        const accessToken = authHeader?.split(' ')[1];

        if (!accessToken) {
            console.log('❌ No access token provided');
            return c.json({error: 'Unauthorized - No token'}, 401);
        }

        console.log('Access token length:', accessToken.length);
        console.log('Access token first 20 chars:', accessToken.substring(0, 20));
        console.log('Validating token for save session...');

        const {data: {user}, error: authError} = await supabaseAnon.auth.getUser(accessToken);

        if (authError) {
            console.log('❌ Save session auth error:', authError.message);
            console.log('Auth error status:', authError.status);
            console.log('Auth error code:', authError.code);
            console.log('Full auth error:', JSON.stringify(authError));
            return c.json({code: 401, message: authError.message}, 401);
        }

        if (!user) {
            console.log('❌ No user found from token');
            return c.json({error: 'Unauthorized - No user'}, 401);
        }

        const newSession = await c.req.json();
        console.log(`✅ Token validated. Saving session for user: ${user.id}`);

        // Use single key for all sessions - get existing and append
        const sessionsKey = `sessions:${user.id}`;
        const existingSessions = await kv.get(sessionsKey) || [];

        // Add new session to array
        const updatedSessions = [...existingSessions, newSession];
        await kv.set(sessionsKey, updatedSessions);

        console.log(`✅ Session saved successfully. Total sessions: ${updatedSessions.length}`);

        return c.json({success: true, session: newSession});
    } catch (error) {
        console.log(`Save session exception: ${error}`);
        return c.json({error: 'Failed to save session'}, 500);
    }
});

// Get user profile
app.get('/make-server-eeff6ec4/profile', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        console.log('Get profile - Auth header present:', !!authHeader);

        const accessToken = authHeader?.split(' ')[1];

        if (!accessToken) {
            console.log('No access token provided');
            return c.json({error: 'Unauthorized - No token'}, 401);
        }

        console.log('Validating token for get profile...');
        const {data: {user}, error: authError} = await supabaseAnon.auth.getUser(accessToken);

        if (authError) {
            console.log(`Get profile auth error: ${authError.message}, Status: ${authError.status}`);
            console.log('Full auth error:', JSON.stringify(authError));
            return c.json({error: 'Unauthorized'}, 401);
        }

        if (!user) {
            console.log('No user found from token');
            return c.json({error: 'Unauthorized - No user'}, 401);
        }

        console.log(`✅ Token validated. Fetching profile for user: ${user.id}`);
        const profileKey = `profile:${user.id}`;
        const profile = await kv.get(profileKey);

        return c.json({
            profile: profile || {
                userId: user.id,
                email: user.email,
                name: user.user_metadata?.name,
                unlockedPlants: ['1', '2'],
                whitelist: ['Messages', 'Phone', 'Music'],
            }
        });
    } catch (error) {
        console.log(`Get profile exception: ${error}`);
        return c.json({error: 'Failed to fetch profile'}, 500);
    }
});

// Update user profile
app.put('/make-server-eeff6ec4/profile', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        console.log('=== UPDATE PROFILE DEBUG ===');
        console.log('Update profile - Auth header present:', !!authHeader);
        console.log('Auth header value:', authHeader);

        const accessToken = authHeader?.split(' ')[1];

        if (!accessToken) {
            console.log('❌ No access token provided');
            return c.json({error: 'Unauthorized - No token'}, 401);
        }

        console.log('Access token length:', accessToken.length);
        console.log('Access token first 20 chars:', accessToken.substring(0, 20));
        console.log('Validating token for update profile...');

        const {data: {user}, error: authError} = await supabaseAnon.auth.getUser(accessToken);

        if (authError) {
            console.log('❌ Update profile auth error:', authError.message);
            console.log('Auth error status:', authError.status);
            console.log('Auth error code:', authError.code);
            console.log('Full auth error:', JSON.stringify(authError));
            return c.json({code: 401, message: authError.message}, 401);
        }

        if (!user) {
            console.log('❌ No user found from token');
            return c.json({error: 'Unauthorized - No user'}, 401);
        }

        console.log(`✅ Token validated. Updating profile for user: ${user.id}`);
        const updates = await c.req.json();
        const profileKey = `profile:${user.id}`;

        // Get existing profile and merge with updates
        const existingProfile = await kv.get(profileKey) || {};
        const updatedProfile = {...existingProfile, ...updates};

        await kv.set(profileKey, updatedProfile);
        console.log(`✅ Profile updated successfully`);

        return c.json({profile: updatedProfile});
    } catch (error) {
        console.log(`Update profile exception: ${error}`);
        return c.json({error: 'Failed to update profile'}, 500);
    }
});

// Health check
app.get('/make-server-eeff6ec4/health', (c) => {
    return c.json({status: 'ok', timestamp: new Date().toISOString()});
});

// Migration endpoint - migrate old session structure to new structure
app.post('/make-server-eeff6ec4/migrate-sessions', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        const accessToken = authHeader?.split(' ')[1];

        if (!accessToken) {
            return c.json({error: 'Unauthorized - No token'}, 401);
        }

        const {data: {user}, error: authError} = await supabaseAnon.auth.getUser(accessToken);

        if (authError || !user) {
            return c.json({error: 'Unauthorized'}, 401);
        }

        console.log(`🔄 Starting migration for user: ${user.id}`);

        // Try to get old sessions using prefix
        const oldSessions = await kv.getByPrefix(`session:${user.id}:`);
        console.log(`Found ${oldSessions?.length || 0} old sessions`);

        if (oldSessions && oldSessions.length > 0) {
            // Save to new structure
            const sessionsKey = `sessions:${user.id}`;
            await kv.set(sessionsKey, oldSessions);
            console.log(`✅ Migrated ${oldSessions.length} sessions to new structure`);

            return c.json({
                success: true,
                migrated: oldSessions.length,
                message: `Successfully migrated ${oldSessions.length} sessions`
            });
        } else {
            return c.json({
                success: true,
                migrated: 0,
                message: 'No sessions to migrate'
            });
        }
    } catch (error) {
        console.log(`Migration exception: ${error}`);
        return c.json({error: 'Migration failed'}, 500);
    }
});

Deno.serve(app.fetch);