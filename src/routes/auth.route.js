const express = require("express");
const router = express.Router();

// Importing controllers
const authController = require("../controllers/auth.controller");

// Importing middlewares
const verifyUser = require("../middlewares/user.mw");

// Manual Auth Routes
router.post("/register", authController.handleRegister);
router.post("/login", authController.handleLogin);
router.post("/logout", authController.handleLogout);

// Verification routes
router.post(
    "/send/verification-email",
    verifyUser,
    authController.handleSendVerificationEmail,
);
router.post("/verify-email", authController.handleVerifyEmail);

module.exports = router;
