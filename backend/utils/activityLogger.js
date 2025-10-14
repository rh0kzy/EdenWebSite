// Activity Logger Utility
// Handles logging of all CRUD operations to the activity_log table

const { supabaseAdmin } = require('../config/supabase');

/**
 * Log an activity to the activity_log table
 * @param {Object} options - Activity log options
 * @param {string} options.entityType - 'brand' or 'perfume'
 * @param {number} options.entityId - ID of the entity
 * @param {string} options.entityName - Name of the entity
 * @param {string} options.actionType - 'create', 'update', or 'delete'
 * @param {Object} options.details - Additional details about the action
 * @param {Object} options.req - Express request object (optional)
 * @returns {Promise<Object>} The created activity log entry
 */
async function logActivity({
    entityType,
    entityId,
    entityName,
    actionType,
    details = {},
    req = null
}) {
    try {
        // Extract request information if available
        const ipAddress = req ? (
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            null
        ) : null;

        const userAgent = req ? req.headers['user-agent'] || null : null;

        // Build user info from request
        const userInfo = req ? {
            method: req.method,
            url: req.originalUrl || req.url,
            timestamp: new Date().toISOString()
        } : null;

        // Insert activity log entry
        const { data, error } = await supabaseAdmin
            .from('activity_log')
            .insert({
                entity_type: entityType,
                entity_id: entityId,
                entity_name: entityName,
                action_type: actionType,
                details: details,
                user_info: userInfo,
                ip_address: ipAddress,
                user_agent: userAgent
            })
            .select()
            .single();

        if (error) {
            // Log error but don't throw - activity logging should not break main operations
            console.error('Failed to log activity:', error);
            return null;
        }

        return data;
    } catch (error) {
        // Catch any errors and log them, but don't throw
        console.error('Error in logActivity:', error);
        return null;
    }
}

/**
 * Get recent activities with pagination
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of activities to fetch (default: 50)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @param {string} options.entityType - Filter by entity type (optional)
 * @param {string} options.actionType - Filter by action type (optional)
 * @returns {Promise<Array>} Array of activity log entries
 */
async function getRecentActivities({
    limit = 50,
    offset = 0,
    entityType = null,
    actionType = null
} = {}) {
    try {
        let query = supabaseAdmin
            .from('activity_log')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters if provided
        if (entityType) {
            query = query.eq('entity_type', entityType);
        }

        if (actionType) {
            query = query.eq('action_type', actionType);
        }

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return {
            activities: data || [],
            total: count || 0,
            limit,
            offset
        };
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        throw error;
    }
}

/**
 * Get activities for a specific entity
 * @param {string} entityType - 'brand' or 'perfume'
 * @param {number} entityId - ID of the entity
 * @param {number} limit - Number of activities to fetch (default: 20)
 * @returns {Promise<Array>} Array of activity log entries for the entity
 */
async function getEntityActivities(entityType, entityId, limit = 20) {
    try {
        const { data, error } = await supabaseAdmin
            .from('activity_log')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error(`Error fetching activities for ${entityType} ${entityId}:`, error);
        throw error;
    }
}

/**
 * Get activity statistics
 * @returns {Promise<Object>} Statistics about activities
 */
async function getActivityStats() {
    try {
        // Get total counts by action type
        const { data: stats, error } = await supabaseAdmin
            .from('activity_log')
            .select('action_type, entity_type');

        if (error) {
            throw error;
        }

        // Calculate statistics
        const statistics = {
            total: stats.length,
            byAction: {
                create: stats.filter(s => s.action_type === 'create').length,
                update: stats.filter(s => s.action_type === 'update').length,
                delete: stats.filter(s => s.action_type === 'delete').length
            },
            byEntity: {
                brand: stats.filter(s => s.entity_type === 'brand').length,
                perfume: stats.filter(s => s.entity_type === 'perfume').length
            }
        };

        // Get recent activity count (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentData, error: recentError } = await supabaseAdmin
            .from('activity_log')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', oneDayAgo);

        if (!recentError) {
            statistics.last24Hours = recentData?.length || 0;
        }

        return statistics;
    } catch (error) {
        console.error('Error fetching activity statistics:', error);
        throw error;
    }
}

module.exports = {
    logActivity,
    getRecentActivities,
    getEntityActivities,
    getActivityStats
};
