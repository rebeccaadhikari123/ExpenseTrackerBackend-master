const Transaction = require("../model/transactionModel");
const requestHandler = require("./requestHandler");

exports.getTransactions = requestHandler.getAll(Transaction);

exports.getTransaction = requestHandler.getOne(Transaction);

exports.postTransaction = requestHandler.createOne(Transaction);

exports.updateTransaction = requestHandler.updateOne(Transaction);

exports.deleteTransaction = requestHandler.deleteOne(Transaction);
