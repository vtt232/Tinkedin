const { promisify } = require("util");

const jwt = require("jsonwebtoken");

const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Post = require("../models/postModel");

const isLogin = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return next();

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const user = await User.findById(decoded.id).select("+passwordChangedAt");

  if (!user) return next();

  const changedPasswordAfter = user.changedPasswordAfter(
    user.passwordChangedAt,
    decoded.iat
  );

  if (changedPasswordAfter) return next();

  req.user = user;
  res.locals.user = user;
  next();
});

const redirectIfNotLogin = (req, res, next) => {
  if (!req.user) return res.redirect("/login");
  return next();
};

const redirectIfLogin = (req, res, next) => {
  if (req.user) return res.redirect("/");
  return next();
};

const loginViewController = (req, res, next) => {
  res.status(200).render("login");
};

const signUpViewController = (req, res, next) => {
  res.status(200).render("signUp");
};

const homeViewController = catchAsync(async (req, res, next) => {
  const query = {
    $or: [
      {
        user: req.user._id,
      },
      {
        user: { $in: req.user.followings },
      },
    ],
  };

  const posts = await Post.find(query).sort("-datePosted").populate("user");

  res.status(200).render("home", { posts });
});

const profileViewController = catchAsync(async (req, res, next) => {
  const profileUser = await User.findById(req.params.id);
  const profileUserInFollowingsList = req.user.followings.find(
    (id) => `${id}` === `${profileUser.id}`
  );
  let alreadyFollowed = profileUserInFollowingsList ? true : false;

  res.status(200).render("profile", { profileUser, alreadyFollowed });
});

const setProfileCurrentUserId = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

const filterCompanyFunction = (user, company) => {
  const skills = company.skills ? company.skills.split(";") : [];
  for (let skill of skills) {
    if (user.resumeString.includes(skill) || user.skills.includes(skill))
      return true;
  }
  return false;
};

const jobsViewController = catchAsync(async (req, res, next) => {
  let companies = await User.find({ isCompany: true });
  companies = companies.filter((company) =>
    filterCompanyFunction(req.user, company)
  );

  res.status(200).render("jobs", { companies });
});

module.exports = {
  isLogin,
  redirectIfLogin,
  redirectIfNotLogin,
  loginViewController,
  signUpViewController,
  homeViewController,
  profileViewController,
  setProfileCurrentUserId,
  jobsViewController,
};
