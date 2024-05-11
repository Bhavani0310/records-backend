const express = require("express");
const router = express.Router();

// Importing controllers
const dashboardController = require("../controllers/dashboard.controller");

// Importing Middlewares
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

router.get(
    "/staff",
    verifyStaff,
    verifyRole(["Staff"]),
    dashboardController.handleGetStaffDepartmentDashboard,
);
router.get(
    "/admin",
    verifyStaff,
    verifyRole(["Administrator"]),
    dashboardController.handleGetAdminInstitutionDashboard,
);
router.get(
    "/admin/:departmentId",
    verifyStaff,
    verifyRole(["Administrator"]),
    dashboardController.handleGetAdminDepartmentDashboard,
);

router.put("/profile/:staffId", dashboardController.handleUpdateProfile);

module.exports = router;
