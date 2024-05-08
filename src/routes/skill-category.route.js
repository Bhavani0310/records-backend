const express = require("express");
const router = express.Router();

// Importing controllers
const skillCategoryController = require("../controllers/skill-category.controller");

// Importing Middlewares
const verifySuperAdmin = require("../middlewares/superadmin.mw");

// Create skill category route
router.post(
    "/",
    verifySuperAdmin,
    skillCategoryController.handleCreateSkillCategory,
);
// Update skill category route
router.put(
    "/:skillCategoryId",
    verifySuperAdmin,
    skillCategoryController.handleUpdateSkillCategory,
);

module.exports = router;
