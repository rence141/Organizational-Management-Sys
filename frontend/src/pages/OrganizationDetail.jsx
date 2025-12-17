// Get single organization by ID
exports.getOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Security check: Ensure the user actually owns/belongs to this org
    // (Optional but recommended: check if req.user.id matches org.owner_ID)
    if (org.owner_ID.toString() !== req.query.userId && org.owner_ID.toString() !== req.user?.id) {
       // You might want to enable this stricter check later
       // return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({
      success: true,
      data: org
    });
  } catch (err) {
    console.error("Get Org Error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};