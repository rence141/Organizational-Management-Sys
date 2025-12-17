const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { protect } = require('../middleware/authmiddleware');

// Apply protect middleware to all routes
router.use(protect);

// 1. GET ALL ORGANIZATIONS (Filtered by User)
// Path: GET /api/organizations
router.get("/", organizationController.getAllOrganizations);

// 2. GET USER ORGANIZATIONS
router.get('/my-organizations', organizationController.getUserOrganizations);

// 3. GET SINGLE ORGANIZATION
router.get("/:id", organizationController.getOrganizationById);

// 4. CREATE ORGANIZATION
router.post("/", organizationController.createOrganization);

// 5. UPDATE ORGANIZATION
router.put("/:id", organizationController.updateOrganization);

// 6. DELETE ORGANIZATION
router.delete("/:id", organizationController.deleteOrganization);

// 7. MEMBER MANAGEMENT ROUTES
router.post('/join', organizationController.joinOrganization);
router.post('/:id/promote', organizationController.promoteMember);
router.post('/:id/kick', organizationController.kickMember);
router.post('/:id/announce', organizationController.createAnnouncement);
router.post('/:id/events', organizationController.createEvent);

module.exports = router;