const Organization = require('../models/organizationModel');
const User = require('../models/userModel');

// @desc    Get all organizations (filtered by user)
// @route   GET /api/organizations
// @access  Private
exports.getAllOrganizations = async (req, res) => {
    try {
        const { search } = req.query;
        const userId = req.user.id; // From protect middleware
        
        // Build query
        const query = {
            $or: [
                { owner_ID: userId },
                { members: userId }
            ]
        };

        if (search) {
            query.$or = [
                ...query.$or,
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const organizations = await Organization.find(query).sort({ createdAt: -1 });
        res.status(200).json(organizations);
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Get organizations for the logged-in user
// @route   GET /api/organizations/my-organizations
// @access  Private
exports.getUserOrganizations = async (req, res) => {
    try {
        const userId = req.user.id; // From protect middleware
        const organizations = await Organization.find({
            $or: [
                { owner_ID: userId },
                { members: userId }
            ]
        }).sort({ createdAt: -1 });
        
        res.status(200).json(organizations);
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Private
exports.getOrganizationById = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id)
            .populate('members', 'name email')
            .populate('owner_ID', 'name email');

        if (!organization) {
            return res.status(404).json({ 
                success: false,
                message: 'Organization not found' 
            });
        }

        // Check if user has access to this organization
        if (!organization.members.some(member => member._id.toString() === req.user.id) && 
            organization.owner_ID._id.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to access this organization' 
            });
        }

        res.status(200).json(organization);
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private
exports.createOrganization = async (req, res) => {
    try {
        const { name, domain, plan, adminEmail } = req.body;
        const userId = req.user.id;

        if (!name || !domain) {
            return res.status(400).json({ 
                success: false,
                message: 'Name and domain are required' 
            });
        }

        // Check if domain is already taken
        const existingOrg = await Organization.findOne({ domain: domain.toLowerCase() });
        if (existingOrg) {
            return res.status(400).json({ 
                success: false,
                message: 'Organization with this domain already exists' 
            });
        }

        const organization = await Organization.create({
            name: name.trim(),
            domain: domain.toLowerCase().trim(),
            plan: plan || 'Basic',
            owner_ID: userId,
            members: [userId],
            adminEmail: adminEmail || req.user.email,
            users: 1,
            status: 'Active'
        });

        // Add organization to user's organizations
        await User.findByIdAndUpdate(userId, {
            $addToSet: { organizations: organization._id }
        });

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: organization
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private
exports.updateOrganization = async (req, res) => {
    try {
        const { name, domain, plan, status } = req.body;
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({ 
                success: false,
                message: 'Organization not found' 
            });
        }

        // Check if user is the owner
        if (organization.owner_ID.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to update this organization' 
            });
        }

        // Update fields if provided
        if (name) organization.name = name.trim();
        if (domain) organization.domain = domain.toLowerCase().trim();
        if (plan) organization.plan = plan;
        if (status) organization.status = status;

        const updatedOrg = await organization.save();

        res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: updatedOrg
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private
exports.deleteOrganization = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({ 
                success: false,
                message: 'Organization not found' 
            });
        }

        // Check if user is the owner
        if (organization.owner_ID.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to delete this organization' 
            });
        }

        await organization.remove();

        res.status(200).json({
            success: true,
            message: 'Organization deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Join organization
// @route   POST /api/organizations/join
// @access  Private
exports.joinOrganization = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.user.id;

        if (!inviteCode) {
            return res.status(400).json({ 
                success: false,
                message: 'Invite code is required' 
            });
        }

        const organization = await Organization.findOne({ inviteCode });

        if (!organization) {
            return res.status(404).json({ 
                success: false,
                message: 'Invalid invite code' 
            });
        }

        // Check if user is already a member
        if (organization.members.includes(userId)) {
            return res.status(400).json({ 
                success: false,
                message: 'You are already a member of this organization' 
            });
        }

        // Add user to organization
        organization.members.push(userId);
        organization.users += 1;
        await organization.save();

        // Add organization to user's organizations
        await User.findByIdAndUpdate(userId, {
            $addToSet: { organizations: organization._id }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully joined the organization',
            data: organization
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Promote member to admin
// @route   POST /api/organizations/:id/promote
// @access  Private
exports.promoteMember = async (req, res) => {
    try {
        const { memberId } = req.body;
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({ 
                success: false,
                message: 'Organization not found' 
            });
        }

        // Check if user is the owner
        if (organization.owner_ID.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to perform this action' 
            });
        }

        // Check if member exists in organization
        if (!organization.members.includes(memberId)) {
            return res.status(400).json({ 
                success: false,
                message: 'User is not a member of this organization' 
            });
        }

        // Add to admins array if not already an admin
        if (!organization.admins) organization.admins = [];
        if (!organization.admins.includes(memberId)) {
            organization.admins.push(memberId);
            await organization.save();
        }

        res.status(200).json({
            success: true,
            message: 'Member promoted to admin successfully',
            data: organization
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Kick member from organization
// @route   POST /api/organizations/:id/kick
// @access  Private
exports.kickMember = async (req, res) => {
    try {
        const { memberId } = req.body;
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({ 
                success: false,
                message: 'Organization not found' 
            });
        }

        // Check if user is the owner or an admin
        if (organization.owner_ID.toString() !== req.user.id && 
            (!organization.admins || !organization.admins.includes(req.user.id))) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to perform this action' 
            });
        }

        // Can't kick the owner
        if (organization.owner_ID.toString() === memberId) {
            return res.status(400).json({ 
                success: false,
                message: 'Cannot remove the organization owner' 
            });
        }

        // Check if member exists in organization
        if (!organization.members.includes(memberId)) {
            return res.status(400).json({ 
                success: false,
                message: 'User is not a member of this organization' 
            });
        }

        // Remove from members and admins
        organization.members = organization.members.filter(id => id.toString() !== memberId);
        if (organization.admins) {
            organization.admins = organization.admins.filter(id => id.toString() !== memberId);
        }
        organization.users = Math.max(0, organization.users - 1);
        await organization.save();

        // Remove organization from user's organizations
        await User.findByIdAndUpdate(memberId, {
            $pull: { organizations: organization._id }
        });

        res.status(200).json({
            success: true,
            message: 'Member removed from organization',
            data: organization
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Create announcement
// @route   POST /api/organizations/:id/announce
// @access  Private
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body;
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({ 
                success: false,
                message: 'Organization not found' 
            });
        }

        // Check if user is a member
        if (!organization.members.includes(req.user.id)) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to post announcements in this organization' 
            });
        }

        // Initialize announcements array if it doesn't exist
        if (!organization.announcements) {
            organization.announcements = [];
        }

        const announcement = {
            title,
            content,
            createdBy: req.user.id,
            createdAt: new Date()
        };

        organization.announcements.push(announcement);
        await organization.save();

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Create event
// @route   POST /api/organizations/:id/events
// @access  Private
exports.createEvent = async (req, res) => {
    try {
        const { title, description, startDate, endDate, location } = req.body;
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({ 
                success: false,
                message: 'Organization not found' 
            });
        }

        // Check if user is a member
        if (!organization.members.includes(req.user.id)) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to create events in this organization' 
            });
        }

        // Initialize events array if it doesn't exist
        if (!organization.events) {
            organization.events = [];
        }

        const event = {
            title,
            description,
            startDate,
            endDate,
            location,
            createdBy: req.user.id,
            createdAt: new Date()
        };

        organization.events.push(event);
        await organization.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};