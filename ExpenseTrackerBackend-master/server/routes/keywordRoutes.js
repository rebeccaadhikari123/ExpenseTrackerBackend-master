const express = require("express");
const authenticationController = require("../controller/authenticationController");
const keywordController = require("../controller/keywordController");

const router = express.Router();

router
  .route("/")
  .get(authenticationController.protect, keywordController.getKeyword);

router
  .route("/")
  .post(authenticationController.protect, keywordController.postKeyword);

module.exports = router;
