const express = require("express");
const router = express.Router();

// Importing controllers
const revisionController = require("../controllers/revision.controller");

// Importing middlewares
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

router.put(
    "/education/:verificationId",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    revisionController.handleEducationRevision,
);

module.exports = router;
