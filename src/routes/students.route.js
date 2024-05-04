const express = require("express");
const router = express.Router();

// Importing controllers
const studentsController = require("../controllers/students.controller");

// Importing Middlewares
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

router.get(
    "/",
    verifyStaff,
    verifyRole(["Administrator"]),
    studentsController.handleGetStudentsHomePage,
);

router.get(
    "/profile/:stundetId",
    verifyStaff,
    verifyRole(["Administrator"]),
    studentsController.handleGetStudentProfile,
);

router.get(
    "/department/:departmentId",
    verifyStaff,
    verifyRole(["Administrator"]),
    studentsController.handleGetStudentDepartmentPageAdmin,
);

router.get(
    "/department",
    verifyStaff,
    verifyRole(["Staff"]),
    studentsController.handleGetStudentDepartmentPageStaff,
);

module.exports = router;
