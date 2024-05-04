const express = require("express");
const router = express.Router();

// Importing controllers
const skillCategoryController = require("../controllers/skill-category.controller");

// Importing Middlewares
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

// Create skill category route
router.post(
    "/",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    skillCategoryController.handleCreateSkillCategory,
);
// Update skill category route
router.put(
    "/:skillCategoryId",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    skillCategoryController.handleUpdateSkillCategory,
);

module.exports = router;
