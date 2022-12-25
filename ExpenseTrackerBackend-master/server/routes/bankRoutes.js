const express = require("express");
const authenticationController = require("../controller/authenticationController");
const bankController = require("../controller/bankController");

const router = express.Router();

router
  .route("/")
  .get(authenticationController.protect, bankController.getBanks);

router
  .route("/")
  .post(authenticationController.protect, bankController.postBanks);

module.exports = router;
