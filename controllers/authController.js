const { promisify } = require("util");

const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const { filterObject, createJsonWebToken } = require("../utils/helpers");

const createAndSendToken = async (args) => {
  const { user, statusCode, req, res } = args;

  const token = await createJsonWebToken(user);

  // Hide sensitive fields
  user.password = undefined;

  res.cookie("jwt", token, {
    maxAge:
      Number(process.env.JWT_COOKIE_EXPIRES_IN) *
      Number(process.env.DAY_SECONDS) *
      1000,
    httpOnly: true,
    secure: req.secure || req.header("x-forwarded-proto") === "https",
  });

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
};

const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Username and password are required", 400));
  }

  const user = await User.findOne({ username }).select("+password");

  const correctCredentials =
    user && (await user.verifyPassword(password, user.password));

  if (!correctCredentials) {
    return next(new AppError("Incorrect username or password", 400));
  }

  createAndSendToken({ req, res, user, statusCode: 200 });
});

const signUp = catchAsync(async (req, res, next) => {
  //Sanitize user input
  const userInput = filterObject(req.body, {
    whiteList: [
      "username",
      "password",
      "email",
      "phoneNumber",
      "website",
      "isCompany",
    ],
  });

  const user = await User.create(userInput);

  //Hash the password (using user document middleware) BEFORE saving the user to the database

  createAndSendToken({ user, req, res, statusCode: 201 });
});

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1];
  token = token || req.cookies.jwt;

  if (!token) {
    return next(new AppError("Please log in to perform this action", 401));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const user = await User.findById(decoded.id).select("+passwordChangedAt");

  if (!user)
    return next(new AppError("No users found with the specified token", 400));

  const changedPasswordAfter = user.changedPasswordAfter(
    user.passwordChangedAt,
    decoded.iat
  );

  if (changedPasswordAfter)
    return next(
      new AppError(
        "Users with this token already changed their password. Please login again",
        400
      )
    );

  req.user = user;
  next();
});

const logout = (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: req.secure || req.header("x-forwarded-proto") === "https",
  });
  res.status(200).json({ status: "success" });
};

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ status: "success", user });
});

module.exports = { signUp, login, protect, logout, getMe };
