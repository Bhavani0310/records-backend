const express = require("express");
const router = express.Router();

// Importing controllers
const verificationController = require("../controllers/verification.controller");

router.put(
    "/education/:verificationId",
    verificationController.handleVerifyEducation,
);

router.get(
    "/education/:verificationId",
    verificationController.handleGetVerifyEducationDetails,
);

router.put(
    "/workexperience/:verificationId",
    verificationController.handleVerifyWorkExperience,
);

router.get(
    "/workexperience/:verificationId",
    verificationController.handleGetVerifyWorkExperienceDetails,
);

router.put(
    "/licensecertification/:verificationId",
    verificationController.handleVerifyLicenseCertification,
);

router.get(
    "/licensecertification/:verificationId",
    verificationController.handleGetVerifyActivityDetails,
);

router.put(
    "/project/:verificationId",
    verificationController.handleVerifyProject,
);

router.get(
    "/project/:verificationId",
    verificationController.handleGetVerifyProjectDetails,
);

router.put(
    "/activity/:verificationId",
    verificationController.handleVerifyActivity,
);

router.get(
    "/activity/:verificationId",
    verificationController.handleGetVerifyActivityDetails,
);

module.exports = router;
