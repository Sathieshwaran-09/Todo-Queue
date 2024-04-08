const express = require("express");
const isAuthenticated = require("../middlewares/auth.js");
const { createTask, deleteTask, updateTask, getMyTask, getSingleTask } = require("../controller/taskController.js");

const router = express.Router();

router.post("/post", isAuthenticated, createTask);
router.delete("/delete/:id", isAuthenticated, deleteTask);
router.put("/update/:id", isAuthenticated, updateTask);
router.get("/mytask", isAuthenticated, getMyTask);
router.get("/single/:id", isAuthenticated, getSingleTask);

module.exports = router;