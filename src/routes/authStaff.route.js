const express = require("express");
const router = express.Router();

// Importing controllers
const authStaffController = require("../controllers/authStaff.controller");

// Importing middlewares
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

// Manual Auth Routes
router.post("/login", authStaffController.handleLogin);
router.post("/logout", verifyStaff, authStaffController.handleLogout);

// Staff Routes
router.post(
    "/staff",
    verifyStaff,
    verifyRole(["Administrator"]),
    authStaffController.handleAddStaff,
);

router.put(
    "/staff/:staffId",
    verifyStaff,
    verifyRole(["Administrator"]),
    authStaffController.handleUpdateStaff,
);

// reset password routes
router.post("/forgot-password", authStaffController.handleSendResetPassMail);
router.post(
    "/reset-password/:password_reset_token",
    authStaffController.handleResetPass,
);

// Session routes
router.post("/verify-session", authStaffController.handleVerifiySession);

module.exports = router;
