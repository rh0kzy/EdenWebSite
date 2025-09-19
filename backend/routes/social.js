/**
 * EDEN PARFUM - SOCIAL MEDIA API ROUTES
 * Comprehensive backend API for social media integration features
 * Supports analytics tracking, share counts, and social engagement metrics
 */

const express = require('express');
const router = express.Router();

// In-memory storage for demo (in production, use a proper database)
let socialAnalytics = {
    pageViews: {},
    shares: {},
    socialClicks: {},
    timeSpent: {},
    scrollDepth: {},
    mostSharedPages: [],
    totalShares: 0,
    totalSocialClicks: 0
};

let socialCounts = {
    followers: {
        instagram: 15243,
        facebook: 8765,
        tiktok: 32567,
        twitter: 5439,
        youtube: 12890,
        whatsapp: 0 // WhatsApp doesn't have public follower counts
    },
    lastUpdated: new Date().toISOString()
};

/**
 * GET /api/social/analytics
 * Retrieve comprehensive social media analytics
 */
router.get('/analytics', (req, res) => {
    try {
        const { page, timeframe = '30d' } = req.query;
        
        // Calculate aggregate metrics
        const totalPageViews = Object.values(socialAnalytics.pageViews).reduce((sum, count) => sum + count, 0);
        const totalShares = Object.values(socialAnalytics.shares).reduce((sum, pageShares) => {
            return sum + Object.values(pageShares).reduce((pageSum, count) => pageSum + count, 0);
        }, 0);
        const totalSocialClicks = Object.values(socialAnalytics.socialClicks).reduce((sum, count) => sum + count, 0);
        
        // Calculate average time spent
        const timeSpentValues = Object.values(socialAnalytics.timeSpent);
        const avgTimeSpent = timeSpentValues.length > 0 
            ? timeSpentValues.reduce((sum, time) => sum + time, 0) / timeSpentValues.length 
            : 0;
        
        // Calculate average scroll depth
        const scrollDepthValues = Object.values(socialAnalytics.scrollDepth);
        const avgScrollDepth = scrollDepthValues.length > 0 
            ? scrollDepthValues.reduce((sum, depth) => sum + depth, 0) / scrollDepthValues.length 
            : 0;
        
        // Get most shared pages
        const mostSharedPages = Object.entries(socialAnalytics.shares)
            .map(([page, shares]) => ({
                page,
                totalShares: Object.values(shares).reduce((sum, count) => sum + count, 0),
                platforms: shares
            }))
            .sort((a, b) => b.totalShares - a.totalShares)
            .slice(0, 10);
        
        // Get platform-specific sharing data
        const platformShares = {};
        Object.values(socialAnalytics.shares).forEach(pageShares => {
            Object.entries(pageShares).forEach(([platform, count]) => {
                platformShares[platform] = (platformShares[platform] || 0) + count;
            });
        });
        
        const analyticsData = {
            summary: {
                totalPageViews,
                totalShares,
                totalSocialClicks,
                avgTimeSpent: Math.round(avgTimeSpent),
                avgScrollDepth: Math.round(avgScrollDepth * 100) / 100,
                conversionRate: totalPageViews > 0 ? Math.round((totalSocialClicks / totalPageViews) * 10000) / 100 : 0
            },
            pageSpecific: page ? {
                pageViews: socialAnalytics.pageViews[page] || 0,
                shares: socialAnalytics.shares[page] || {},
                socialClicks: socialAnalytics.socialClicks[page] || 0,
                timeSpent: socialAnalytics.timeSpent[page] || 0,
                scrollDepth: socialAnalytics.scrollDepth[page] || 0
            } : null,
            mostSharedPages,
            platformShares,
            followers: socialCounts.followers,
            lastUpdated: new Date().toISOString(),
            timeframe
        };
        
        res.json({
            success: true,
            data: analyticsData
        });
        
    } catch (error) {
        console.error('Analytics retrieval error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve analytics data'
        });
    }
});

/**
 * POST /api/social/analytics/track
 * Track social media interaction events
 */
router.post('/analytics/track', (req, res) => {
    try {
        const { 
            eventType, 
            page, 
            platform, 
            value, 
            userAgent, 
            timestamp = Date.now() 
        } = req.body;
        
        // Validate required fields
        if (!eventType || !page) {
            return res.status(400).json({
                success: false,
                error: 'Event type and page are required'
            });
        }
        
        // Initialize page data if not exists
        if (!socialAnalytics.pageViews[page]) {
            socialAnalytics.pageViews[page] = 0;
            socialAnalytics.shares[page] = {};
            socialAnalytics.socialClicks[page] = 0;
            socialAnalytics.timeSpent[page] = 0;
            socialAnalytics.scrollDepth[page] = 0;
        }
        
        // Process different event types
        switch (eventType) {
            case 'page_view':
                socialAnalytics.pageViews[page]++;
                break;
                
            case 'social_share':
                if (!platform) {
                    return res.status(400).json({
                        success: false,
                        error: 'Platform is required for share events'
                    });
                }
                if (!socialAnalytics.shares[page][platform]) {
                    socialAnalytics.shares[page][platform] = 0;
                }
                socialAnalytics.shares[page][platform]++;
                socialAnalytics.totalShares++;
                break;
                
            case 'social_click':
                if (!platform) {
                    return res.status(400).json({
                        success: false,
                        error: 'Platform is required for click events'
                    });
                }
                socialAnalytics.socialClicks[page]++;
                socialAnalytics.totalSocialClicks++;
                break;
                
            case 'time_spent':
                if (typeof value !== 'number') {
                    return res.status(400).json({
                        success: false,
                        error: 'Time value is required for time_spent events'
                    });
                }
                socialAnalytics.timeSpent[page] = Math.max(socialAnalytics.timeSpent[page], value);
                break;
                
            case 'scroll_depth':
                if (typeof value !== 'number') {
                    return res.status(400).json({
                        success: false,
                        error: 'Scroll depth value is required for scroll_depth events'
                    });
                }
                socialAnalytics.scrollDepth[page] = Math.max(socialAnalytics.scrollDepth[page], value);
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid event type'
                });
        }
        
        res.json({
            success: true,
            message: 'Event tracked successfully',
            eventType,
            page,
            platform,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track analytics event'
        });
    }
});

/**
 * GET /api/social/share-counts
 * Get current social media follower counts
 */
router.get('/share-counts', (req, res) => {
    try {
        const { platform } = req.query;
        
        if (platform) {
            // Return specific platform count
            const count = socialCounts.followers[platform];
            if (count === undefined) {
                return res.status(404).json({
                    success: false,
                    error: 'Platform not found'
                });
            }
            
            res.json({
                success: true,
                data: {
                    platform,
                    count,
                    lastUpdated: socialCounts.lastUpdated
                }
            });
        } else {
            // Return all platform counts
            res.json({
                success: true,
                data: {
                    followers: socialCounts.followers,
                    lastUpdated: socialCounts.lastUpdated
                }
            });
        }
        
    } catch (error) {
        console.error('Share counts retrieval error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve share counts'
        });
    }
});

/**
 * PUT /api/social/share-counts
 * Update social media follower counts (admin only)
 */
router.put('/share-counts', (req, res) => {
    try {
        const { platform, count, followers } = req.body;
        
        if (followers) {
            // Bulk update all platforms
            Object.keys(followers).forEach(platform => {
                if (socialCounts.followers.hasOwnProperty(platform)) {
                    socialCounts.followers[platform] = parseInt(followers[platform]) || 0;
                }
            });
        } else if (platform && count !== undefined) {
            // Update specific platform
            if (!socialCounts.followers.hasOwnProperty(platform)) {
                return res.status(404).json({
                    success: false,
                    error: 'Platform not found'
                });
            }
            
            socialCounts.followers[platform] = parseInt(count) || 0;
        } else {
            return res.status(400).json({
                success: false,
                error: 'Either platform and count, or followers object is required'
            });
        }
        
        socialCounts.lastUpdated = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'Follower counts updated successfully',
            data: {
                followers: socialCounts.followers,
                lastUpdated: socialCounts.lastUpdated
            }
        });
        
    } catch (error) {
        console.error('Share counts update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update share counts'
        });
    }
});

/**
 * GET /api/social/trending
 * Get trending social media content and engagement metrics
 */
router.get('/trending', (req, res) => {
    try {
        const { limit = 10, timeframe = '7d' } = req.query;
        
        // Calculate trending pages based on recent activity
        const trendingPages = Object.entries(socialAnalytics.shares)
            .map(([page, shares]) => {
                const totalShares = Object.values(shares).reduce((sum, count) => sum + count, 0);
                const socialClicks = socialAnalytics.socialClicks[page] || 0;
                const pageViews = socialAnalytics.pageViews[page] || 0;
                
                // Calculate engagement score (weighted formula)
                const engagementScore = (totalShares * 10) + (socialClicks * 5) + (pageViews * 1);
                
                return {
                    page,
                    totalShares,
                    socialClicks,
                    pageViews,
                    engagementScore,
                    shareRate: pageViews > 0 ? Math.round((totalShares / pageViews) * 10000) / 100 : 0,
                    clickRate: pageViews > 0 ? Math.round((socialClicks / pageViews) * 10000) / 100 : 0
                };
            })
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, parseInt(limit));
        
        // Calculate platform engagement rates
        const platformEngagement = {};
        Object.values(socialAnalytics.shares).forEach(pageShares => {
            Object.entries(pageShares).forEach(([platform, count]) => {
                if (!platformEngagement[platform]) {
                    platformEngagement[platform] = { shares: 0, clicks: 0 };
                }
                platformEngagement[platform].shares += count;
            });
        });
        
        // Add click data to platform engagement
        Object.entries(socialAnalytics.socialClicks).forEach(([page, clicks]) => {
            // Distribute clicks proportionally across platforms (simplified)
            const pageShares = socialAnalytics.shares[page] || {};
            const totalPageShares = Object.values(pageShares).reduce((sum, count) => sum + count, 0);
            
            if (totalPageShares > 0) {
                Object.entries(pageShares).forEach(([platform, shares]) => {
                    const proportion = shares / totalPageShares;
                    platformEngagement[platform].clicks += Math.round(clicks * proportion);
                });
            }
        });
        
        res.json({
            success: true,
            data: {
                trendingPages,
                platformEngagement,
                timeframe,
                generatedAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Trending data retrieval error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve trending data'
        });
    }
});

/**
 * POST /api/social/engagement/log
 * Log detailed user engagement events for analysis
 */
router.post('/engagement/log', (req, res) => {
    try {
        const {
            sessionId,
            userId,
            events,
            userAgent,
            referrer,
            timestamp = Date.now()
        } = req.body;
        
        if (!events || !Array.isArray(events)) {
            return res.status(400).json({
                success: false,
                error: 'Events array is required'
            });
        }
        
        // Process batch of engagement events
        const processedEvents = events.map(event => {
            const {
                type,
                page,
                platform,
                value,
                metadata = {}
            } = event;
            
            // Track individual event (reuse existing tracking logic)
            if (type && page) {
                // Initialize page data if needed
                if (!socialAnalytics.pageViews[page]) {
                    socialAnalytics.pageViews[page] = 0;
                    socialAnalytics.shares[page] = {};
                    socialAnalytics.socialClicks[page] = 0;
                    socialAnalytics.timeSpent[page] = 0;
                    socialAnalytics.scrollDepth[page] = 0;
                }
                
                // Process based on event type
                switch (type) {
                    case 'social_guide_view':
                        // Track when users view Instagram/TikTok guides
                        if (!socialAnalytics.guideViews) socialAnalytics.guideViews = {};
                        if (!socialAnalytics.guideViews[platform]) socialAnalytics.guideViews[platform] = 0;
                        socialAnalytics.guideViews[platform]++;
                        break;
                        
                    case 'social_guide_complete':
                        // Track when users complete guides
                        if (!socialAnalytics.guideCompletions) socialAnalytics.guideCompletions = {};
                        if (!socialAnalytics.guideCompletions[platform]) socialAnalytics.guideCompletions[platform] = 0;
                        socialAnalytics.guideCompletions[platform]++;
                        break;
                        
                    case 'floating_bar_interaction':
                        // Track floating social bar usage
                        if (!socialAnalytics.floatingBarClicks) socialAnalytics.floatingBarClicks = 0;
                        socialAnalytics.floatingBarClicks++;
                        break;
                        
                    case 'caption_copy':
                        // Track caption copying
                        if (!socialAnalytics.captionCopies) socialAnalytics.captionCopies = {};
                        if (!socialAnalytics.captionCopies[platform]) socialAnalytics.captionCopies[platform] = 0;
                        socialAnalytics.captionCopies[platform]++;
                        break;
                }
            }
            
            return {
                ...event,
                processed: true,
                timestamp: new Date().toISOString()
            };
        });
        
        res.json({
            success: true,
            message: `Processed ${processedEvents.length} engagement events`,
            processedEvents: processedEvents.length,
            sessionId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Engagement logging error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log engagement events'
        });
    }
});

/**
 * GET /api/social/dashboard
 * Get comprehensive dashboard data for admin panel
 */
router.get('/dashboard', (req, res) => {
    try {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Calculate key metrics
        const totalPageViews = Object.values(socialAnalytics.pageViews).reduce((sum, count) => sum + count, 0);
        const totalShares = Object.values(socialAnalytics.shares).reduce((sum, pageShares) => {
            return sum + Object.values(pageShares).reduce((pageSum, count) => pageSum + count, 0);
        }, 0);
        
        // Top performing pages
        const topPages = Object.entries(socialAnalytics.pageViews)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([page, views]) => ({
                page,
                views,
                shares: Object.values(socialAnalytics.shares[page] || {}).reduce((sum, count) => sum + count, 0)
            }));
        
        // Platform performance
        const platformStats = Object.entries(socialCounts.followers).map(([platform, followers]) => {
            const shares = Object.values(socialAnalytics.shares).reduce((sum, pageShares) => {
                return sum + (pageShares[platform] || 0);
            }, 0);
            
            return {
                platform,
                followers,
                shares,
                engagement: followers > 0 ? Math.round((shares / followers) * 10000) / 100 : 0
            };
        });
        
        const dashboardData = {
            overview: {
                totalPageViews,
                totalShares,
                totalSocialClicks: socialAnalytics.totalSocialClicks,
                avgEngagement: totalPageViews > 0 ? Math.round((totalShares / totalPageViews) * 10000) / 100 : 0,
                guideViews: socialAnalytics.guideViews || {},
                guideCompletions: socialAnalytics.guideCompletions || {},
                floatingBarClicks: socialAnalytics.floatingBarClicks || 0
            },
            topPages,
            platformStats,
            followers: socialCounts.followers,
            lastUpdated: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: dashboardData
        });
        
    } catch (error) {
        console.error('Dashboard data retrieval error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve dashboard data'
        });
    }
});

module.exports = router;