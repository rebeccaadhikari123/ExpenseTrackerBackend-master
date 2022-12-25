const express = require("express");
const authenticationController = require("../controller/authenticationController");
const transactionController = require("../controller/transactionController");

const router = express.Router();

router
  .route("/")
  .get(authenticationController.protect, transactionController.getTransactions);

router
  .route("/transaction/:id/:userId")
  .get(authenticationController.protect, transactionController.getTransaction);
router
  .route("/")
  .post(authenticationController.protect, transactionController.postTransaction);

router
  .route("/transaction/:id")
  .patch(authenticationController.protect, transactionController.updateTransaction);

router
  .route("/transaction/:id")
  .delete(authenticationController.protect, transactionController.deleteTransaction);

module.exports = router;
