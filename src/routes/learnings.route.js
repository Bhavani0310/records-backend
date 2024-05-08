const express = require("express");
const router = express.Router();

// Importing Controllers
const learningsController = require("../controllers/learnings.controller");

router.get("/", learningsController.handleGetUserLearnings);

router.get("/course/:courseId", learningsController.handleGetCourse);

router.get("/course");

router.put("/progress", learningsController.handleUpdateCourseProgress);

router.put("/goal", learningsController.handleSetLearningGoal);

router.post("/notes", learningsController.handleAddNotes);
router.get("/notes", learningsController.handleGetNotes);
router.put("/notes", learningsController.handleUpdateNotes);
router.delete("/notes", learningsController.handleDeleteNotes);

module.exports = router;
