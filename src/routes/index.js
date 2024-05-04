const express = require("express");
const router = express.Router();

// Importing middlewares
const verifyUser = require("../middlewares/user.mw");

// Importing routes
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const toolsRoute = require("./tools.route");
const skillRoute = require("./skill.route");
const skillCategoryRoute = require("./skill-category.route");
const learningsRoute = require("./learnings.route");

const authstaffRoute = require("./authStaff.route");
const dashboardRoute = require("./dashboard.route");
const studentsRoute = require("./students.route");
const institutionRoute = require("./institution.route");
const placementRoute = require("./placement.route");

// Non authorization routes
router.use("/auth", authRoute);
router.use("/authstaff", authstaffRoute);

// Authorization routes
router.use("/user", verifyUser, userRoute);
router.use("/tools", verifyUser, toolsRoute);
router.use("/learnings", verifyUser, learningsRoute);
router.use("/skill", verifyUser, skillRoute);
router.use("/skill-category", verifyUser, skillCategoryRoute);

// Staff Routes
router.use("/dashboard", dashboardRoute);
router.use("/students", studentsRoute);
router.use("/placement", placementRoute);
router.use("/institution", institutionRoute);

module.exports = router;
