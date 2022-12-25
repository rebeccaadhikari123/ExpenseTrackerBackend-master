const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../model/userAuthModel");

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).send({
      status: "Success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError(
          "You are not logged In !!! Please Log In to Get Access.",
          401
        )
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token no longer exists !!!",
          401
        )
      );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "You recently changed your password. Please login again.",
          401
        )
      );
    }

    let doc = await Model.find({ addedBy: currentUser._id })
      .populate({
        path: "addedBy",
        select: "username email",
        model: "User",
    })
    .sort({ addedOn: -1 });  
     
    if (doc.length == 0) {
      return res.status(404).json({
        status: "Success",
        postCount: doc.length,
        message: "No data available",
      });
    }

    res.status(200).json({
      status: "Success",
      postCount: doc.length,
      data: doc,
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findOne({
      movieId: req.params.id,
      addedBy: req.params.userId,
    });
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with this ID", 404));
    }

    res.status(200).json({
      status: "Success",
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No flick with this ID", 404));
    }
    res.status(200).json({
      status: "Success",
      data: doc,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No flick with this ID", 404));
    }

    res.status(200).json({
      status: "Success",
      data: "Data deleted Sucessfully",
    });
  });