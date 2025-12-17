const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const AuditLog = require('../models/auditLogModel');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // Get total users
        const totalUsers = await User.countDocuments();
        
        // Get total organizations
        const totalOrganizations = await Organization.countDocuments();
        
        // Get new users in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        // Get active users (logged in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const activeUsers = await User.countDocuments({
            lastLogin: { $gte: sevenDaysAgo }
        });
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalOrganizations,
                newUsers,
                activeUsers,
                userGrowth: await calculateGrowth('users'),
                orgGrowth: await calculateGrowth('organizations')
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get user signup trends
// @route   GET /api/analytics/trends/users
// @access  Private/Admin
exports.getUserSignupTrends = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get user signups by day
        const userSignups = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get user activity by day
        const userActivity = await AuditLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo },
                    action: { $in: ['login', 'profile_update', 'password_change'] }
                }
            },
            {
                $group: {
                    _id: { 
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        action: "$action"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    activities: {
                        $push: {
                            action: "$_id.action",
                            count: "$count"
                        }
                    },
                    total: { $sum: "$count" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        res.json({
            success: true,
            data: {
                signups: userSignups,
                activity: userActivity
            }
        });
    } catch (error) {
        console.error('Error getting user trends:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user trends',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get organization statistics
// @route   GET /api/analytics/organizations
// @access  Private/Admin
exports.getOrganizationStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get top organizations by member count
        const topOrganizations = await Organization.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'ownerInfo'
                }
            },
            {
                $project: {
                    name: 1,
                    memberCount: { $size: '$members' },
                    createdAt: 1,
                    ownerName: { $arrayElemAt: ['$ownerInfo.name', 0] },
                    ownerEmail: { $arrayElemAt: ['$ownerInfo.email', 0] },
                    isActive: { $gt: [{ $size: '$members' }, 0] }
                }
            },
            { $sort: { memberCount: -1 } },
            { $limit: 10 }
        ]);
        
        // Get organization growth
        const orgGrowth = await Organization.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        res.json({
            success: true,
            data: {
                topOrganizations,
                growth: orgGrowth
            }
        });
    } catch (error) {
        console.error('Error getting organization stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving organization statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to calculate growth percentage
async function calculateGrowth(collection) {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(now.getDate() - 30);
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    
    const model = collection === 'users' ? User : Organization;
    
    const [currentCount, previousCount] = await Promise.all([
        model.countDocuments({ 
            createdAt: { $gte: currentPeriodStart } 
        }),
        model.countDocuments({ 
            createdAt: { 
                $gte: previousPeriodStart, 
                $lt: currentPeriodStart 
            } 
        })
    ]);
    
    if (previousCount === 0) return currentCount > 0 ? 100 : 0;
    return ((currentCount - previousCount) / previousCount) * 100;
}
