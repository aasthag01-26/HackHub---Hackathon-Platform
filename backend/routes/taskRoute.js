
const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController.js");

const { protect } = require("../middleware/authMiddleware.js");

router.route("/")
  .post(protect, createTask)
  .get(protect, getTasks);

router.route("/:id")
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
