const express = require("express");
const isAuthenticated = require("../middlewares/auth.js");
const { login, logout, myProfile, register } = require("../controller/userController.js");

const router = express.Router();

router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, myProfile);
router.post("/register", register);

module.exports = router;