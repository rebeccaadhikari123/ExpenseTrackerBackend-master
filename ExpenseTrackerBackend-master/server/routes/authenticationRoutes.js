const express = require("express");
const authenticationController = require("../controller/authenticationController");

const router = express.Router();

router.post("/login", authenticationController.login);
router.post("/signup", authenticationController.signup);
router.post("/forgotPassword", authenticationController.forgotPassword);
router.patch("/resetPassword/:token", authenticationController.resetPassword);

//Protects all routes after this Middleware
router.use(authenticationController.protect);
router.patch("/updatePassword", authenticationController.updatePassword);
router.get("/verifyToken", authenticationController.verify);

module.exports = router;
