const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../model/userAuthModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign(
    {
      id: id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: "Success",
    token,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email or Password", 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
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
      new AppError("The user belonging to this token no longer exists !!!", 401)
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

  req.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong !!!", 401));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // const resetURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `Forgot your FlickList password ? Submit a password reset request with your new password and password confirm using reset code below.
  \n ${resetToken}
  \n If you didnt forget your password, please ignore this message`;

  try {
    await sendEmail({
      email: user.email,
      subject:
        "Your FlickList account password reset token. (Valid for 10 minutes)",
      message,
    });
    res.status(200).json({
      status: "Success",
      message: "Token sent to provided email.",
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);

    return next(
      new AppError(
        "There was an error sending the resetToken to email. Please try again.",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is Invalid or Expired", 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  createSendToken(user, 200, res);
});

exports.verify = (req, res, next) => {
  res.status(200).json({
    status: "Success",
  });
};

