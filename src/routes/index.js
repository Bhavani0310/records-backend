const express = require("express");
const router = express.Router();

// Importing middlewares
const verifyUser = require("../middlewares/user.mw");
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

// Importing routes
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const toolsRoute = require("./tools.route");
const skillRoute = require("./skill.route");
const skillCategoryRoute = require("./skill-category.route");
const learningsRoute = require("./learnings.route");

const authstaffRoute = require("./authStaff.route");
const revisionRoute = require("./revision.route");
const verificationRoute = require("./verification.route");
const dashboardRoute = require("./dashboard.route");
const studentsRoute = require("./students.route");
const institutionRoute = require("./institution.route");
const placementRoute = require("./placement.route");

const superadminRoute = require("./superadmin.route");

// Non authorization routes
router.use("/auth", authRoute);
router.use("/auth/staff", authstaffRoute);

// Authorization routes
router.use("/user", verifyUser, userRoute);
router.use("/tools", verifyUser, toolsRoute);
router.use("/learnings", verifyUser, learningsRoute);
router.use("/skill", skillRoute);
router.use("/skill-category", skillCategoryRoute);

// Staff Routes
router.use(
    "/revision",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    revisionRoute,
);
router.use(
    "/verify",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    verificationRoute,
);
router.use("/dashboard", dashboardRoute);
router.use("/students", studentsRoute);
router.use("/placement", placementRoute);
router.use("/institution", institutionRoute);

router.use("/superadmin", superadminRoute);

module.exports = router;
