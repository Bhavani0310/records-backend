const express = require("express");
const router = express.Router();

// Importing controllers
const revisionController = require("../controllers/revision.controller");

router.put(
    "/education/:verificationId",
    revisionController.handleEducationRevision,
);

router.put(
    "/workexperience/:verificationId",
    revisionController.handleWorkExperienceRevision,
);

router.put(
    "/licensecertification/:verificationId",
    revisionController.handleLicenseCertificationRevision,
);

router.put(
    "/project/:verificationId",
    revisionController.handleProjectRevision,
);

router.put(
    "/activity/:verificationId",
    revisionController.handleActivityRevision,
);

module.exports = router;
