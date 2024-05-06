const express = require("express");
const router = express.Router();

// Importing controllers
const superadminController = require("../controllers/superadmin.controller");
const institutionController = require("../controllers/institution.controller");

// Importing Middlewares
const verifySuperAdmin = require("../middlewares/superadmin.mw");

router.post("/login", superadminController.handleSuperAdminLogin);

router.post(
    "/logout",
    verifySuperAdmin,
    superadminController.handleSuperAdminLogout,
);

router.post(
    "/forgot-password",
    superadminController.handleSuperAdminForgotPassword,
);
router.post(
    "/change-password/:password_reset_token",
    superadminController.handleSuperAdminResetPassword,
);

// Add Institution
router.post(
    "/institution",
    verifySuperAdmin,
    institutionController.handleAddInstitution,
);

// Add Administrative Department
router.post(
    "/department",
    verifySuperAdmin,
    superadminController.handleAddAdministrativeDepartment,
);

// Add SuperAdmin

router.post(
    "/register",
    verifySuperAdmin,
    superadminController.handleAddSuperAdmin,
);

// Add Admin for Institution

router.post(
    "/admin",
    verifySuperAdmin,
    superadminController.handleAddAdminForInstitution,
);

module.exports = router;
