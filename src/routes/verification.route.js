const express = require("express");
const router = express.Router();

// Importing controllers
const verificationController = require("../controllers/verification.controller");

// Importing middlewares
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

router.put(
    "/education/:verificationId",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    verificationController.handleVerifyEducation,
);

router.get(
    "/education/:verificationId",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    verificationController.handleGetVerifyEducationDetails,
);

module.exports = router;
