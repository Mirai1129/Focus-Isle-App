// @ts-nocheck - This is a Deno/Supabase Edge Function file
/**
 * Activity Log System
 * Tracks user activities: who did what, where, and when
 */

import {createClient} from "jsr:@supabase/supabase-js@2.49.8";

// Log entry interface
export interface ActivityLog {
    id: string;
    timestamp: string;
    // WHO
    userId: string | null;
    userEmail: string | null;
    userName: string | null;
    // WHERE
    ipAddress: string;
    userAgent: string;
    endpoint: string;
    method: string;
    // WHAT
    action: string;
    category: ActivityCategory;
    details: Record<string, any>;
    // RESULT
    statusCode: number;
    success: boolean;
    errorMessage?: string;
    // PERFORMANCE
    duration?: number;
}

export type ActivityCategory =
    | 'auth'        // Login, logout, signup
    | 'session'     // Focus sessions
    | 'profile'     // Profile updates
    | 'plant'       // Plant unlocks, selections
    | 'whitelist'   // Whitelist changes
    | 'system'      // Health checks, migrations
    | 'admin';      // Admin operations

// Predefined actions
export const Actions = {
    // Auth
    SIGNUP: 'user.signup',
    LOGIN: 'user.login',
    LOGOUT: 'user.logout',
    TOKEN_REFRESH: 'user.token_refresh',

    // Sessions
    SESSION_START: 'session.start',
    SESSION_COMPLETE: 'session.complete',
    SESSION_FAIL: 'session.fail',
    SESSION_LIST: 'session.list',

    // Profile
    PROFILE_VIEW: 'profile.view',
    PROFILE_UPDATE: 'profile.update',

    // Plants
    PLANT_UNLOCK: 'plant.unlock',
    PLANT_SELECT: 'plant.select',

    // Whitelist
    WHITELIST_ADD: 'whitelist.add',
    WHITELIST_REMOVE: 'whitelist.remove',
    WHITELIST_UPDATE: 'whitelist.update',

    // System
    HEALTH_CHECK: 'system.health',
    MIGRATION: 'system.migration',

    // Admin
    LOGS_VIEW: 'admin.logs_view',
    LOGS_EXPORT: 'admin.logs_export',
} as const;

const client = () => createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

// Generate unique ID
const generateId = (): string => {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Store a single activity log
export const logActivity = async (log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<string> => {
    const supabase = client();
    const id = generateId();
    const timestamp = new Date().toISOString();

    const fullLog: ActivityLog = {
        id,
        timestamp,
        ...log,
    };

    // Store in KV with prefix for easy querying
    const key = `activity_log:${timestamp}:${id}`;

    const {error} = await supabase.from("kv_store_eeff6ec4").upsert({
        key,
        value: fullLog
    });

    if (error) {
        console.error(`Failed to log activity: ${error.message}`);
        throw new Error(error.message);
    }

    // Also log to console for real-time monitoring
    console.log(`📝 [${fullLog.category.toUpperCase()}] ${fullLog.action} | User: ${fullLog.userId || 'anonymous'} | ${fullLog.method} ${fullLog.endpoint} | Status: ${fullLog.statusCode}`);

    return id;
};

// Get logs by user ID
export const getLogsByUser = async (userId: string, limit = 100): Promise<ActivityLog[]> => {
    const supabase = client();

    const {data, error} = await supabase
        .from("kv_store_eeff6ec4")
        .select("value")
        .like("key", "activity_log:%")
        .order("key", {ascending: false});

    if (error) {
        throw new Error(error.message);
    }

    const logs = data?.map(d => d.value as ActivityLog) || [];
    return logs
        .filter(log => log.userId === userId)
        .slice(0, limit);
};

// Get logs by category
export const getLogsByCategory = async (category: ActivityCategory, limit = 100): Promise<ActivityLog[]> => {
    const supabase = client();

    const {data, error} = await supabase
        .from("kv_store_eeff6ec4")
        .select("value")
        .like("key", "activity_log:%")
        .order("key", {ascending: false});

    if (error) {
        throw new Error(error.message);
    }

    const logs = data?.map(d => d.value as ActivityLog) || [];
    return logs
        .filter(log => log.category === category)
        .slice(0, limit);
};

// Get logs by action
export const getLogsByAction = async (action: string, limit = 100): Promise<ActivityLog[]> => {
    const supabase = client();

    const {data, error} = await supabase
        .from("kv_store_eeff6ec4")
        .select("value")
        .like("key", "activity_log:%")
        .order("key", {ascending: false});

    if (error) {
        throw new Error(error.message);
    }

    const logs = data?.map(d => d.value as ActivityLog) || [];
    return logs
        .filter(log => log.action === action)
        .slice(0, limit);
};

// Get logs within time range
export const getLogsByTimeRange = async (
    startTime: string,
    endTime: string,
    limit = 500
): Promise<ActivityLog[]> => {
    const supabase = client();

    const startKey = `activity_log:${startTime}`;
    const endKey = `activity_log:${endTime}`;

    const {data, error} = await supabase
        .from("kv_store_eeff6ec4")
        .select("value")
        .gte("key", startKey)
        .lte("key", endKey + "~")
        .order("key", {ascending: false});

    if (error) {
        throw new Error(error.message);
    }

    return (data?.map(d => d.value as ActivityLog) || []).slice(0, limit);
};

// Get recent logs
export const getRecentLogs = async (limit = 100): Promise<ActivityLog[]> => {
    const supabase = client();

    const {data, error} = await supabase
        .from("kv_store_eeff6ec4")
        .select("key, value")
        .like("key", "activity_log:%")
        .order("key", {ascending: false})
        .limit(limit);

    if (error) {
        throw new Error(error.message);
    }

    return data?.map(d => d.value as ActivityLog) || [];
};

// Get activity summary/statistics
export const getActivityStats = async (
    userId?: string,
    startTime?: string,
    endTime?: string
): Promise<{
    totalLogs: number;
    byCategory: Record<string, number>;
    byAction: Record<string, number>;
    byStatus: { success: number; failure: number };
    recentActivity: ActivityLog[];
}> => {
    const supabase = client();

    let query = supabase
        .from("kv_store_eeff6ec4")
        .select("value")
        .like("key", "activity_log:%")
        .order("key", {ascending: false});

    const {data, error} = await query;

    if (error) {
        throw new Error(error.message);
    }

    let logs = data?.map(d => d.value as ActivityLog) || [];

    // Filter by user if specified
    if (userId) {
        logs = logs.filter(log => log.userId === userId);
    }

    // Filter by time range if specified
    if (startTime) {
        logs = logs.filter(log => log.timestamp >= startTime);
    }
    if (endTime) {
        logs = logs.filter(log => log.timestamp <= endTime);
    }

    // Calculate statistics
    const byCategory: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    let successCount = 0;
    let failureCount = 0;

    for (const log of logs) {
        byCategory[log.category] = (byCategory[log.category] || 0) + 1;
        byAction[log.action] = (byAction[log.action] || 0) + 1;
        if (log.success) {
            successCount++;
        } else {
            failureCount++;
        }
    }

    return {
        totalLogs: logs.length,
        byCategory,
        byAction,
        byStatus: {success: successCount, failure: failureCount},
        recentActivity: logs.slice(0, 10),
    };
};

// Search logs with multiple filters
export const searchLogs = async (filters: {
    userId?: string;
    category?: ActivityCategory;
    action?: string;
    startTime?: string;
    endTime?: string;
    success?: boolean;
    ipAddress?: string;
    limit?: number;
}): Promise<ActivityLog[]> => {
    const supabase = client();

    const {data, error} = await supabase
        .from("kv_store_eeff6ec4")
        .select("value")
        .like("key", "activity_log:%")
        .order("key", {ascending: false});

    if (error) {
        throw new Error(error.message);
    }

    let logs = data?.map(d => d.value as ActivityLog) || [];

    // Apply filters
    if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
    }
    if (filters.category) {
        logs = logs.filter(log => log.category === filters.category);
    }
    if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
    }
    if (filters.startTime) {
        logs = logs.filter(log => log.timestamp >= filters.startTime);
    }
    if (filters.endTime) {
        logs = logs.filter(log => log.timestamp <= filters.endTime);
    }
    if (filters.success !== undefined) {
        logs = logs.filter(log => log.success === filters.success);
    }
    if (filters.ipAddress) {
        logs = logs.filter(log => log.ipAddress === filters.ipAddress);
    }

    return logs.slice(0, filters.limit || 100);
};

// Delete old logs (cleanup)
export const deleteOldLogs = async (olderThanDays: number): Promise<number> => {
    const supabase = client();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffKey = `activity_log:${cutoffDate.toISOString()}`;

    // First, get the keys to delete
    const {data, error: selectError} = await supabase
        .from("kv_store_eeff6ec4")
        .select("key")
        .like("key", "activity_log:%")
        .lt("key", cutoffKey);

    if (selectError) {
        throw new Error(selectError.message);
    }

    if (!data || data.length === 0) {
        return 0;
    }

    const keysToDelete = data.map(d => d.key);

    // Delete in batches
    const batchSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < keysToDelete.length; i += batchSize) {
        const batch = keysToDelete.slice(i, i + batchSize);
        const {error: deleteError} = await supabase
            .from("kv_store_eeff6ec4")
            .delete()
            .in("key", batch);

        if (deleteError) {
            console.error(`Failed to delete batch: ${deleteError.message}`);
        } else {
            deletedCount += batch.length;
        }
    }

    console.log(`🧹 Cleaned up ${deletedCount} old activity logs`);
    return deletedCount;
};

// Helper to extract client info from request
export const extractClientInfo = (c: any): {
    ipAddress: string;
    userAgent: string;
    endpoint: string;
    method: string;
} => {
    const headers = c.req.raw.headers;

    // Try to get real IP from various headers (for proxied requests)
    const ipAddress =
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') || // Cloudflare
        c.req.raw.remoteAddr?.hostname ||
        'unknown';

    const userAgent = headers.get('user-agent') || 'unknown';
    const endpoint = c.req.path;
    const method = c.req.method;

    return {ipAddress, userAgent, endpoint, method};
};
