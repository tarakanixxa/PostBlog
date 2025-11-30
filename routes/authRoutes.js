const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const authRequired = require("../middleware/authRequired");


router.get("/profile/:id", authRequired, authController.getProfile);


router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/logout", authController.logout);


router.get("/delete-account", authController.deleteAccount);
router.post("/edit-profile", authController.editProfile);

module.exports = router;
