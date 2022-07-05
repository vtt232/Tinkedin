const express = require("express");

const viewController = require("../controllers/viewController");

const router = express.Router();

router.use(viewController.isLogin);

router.get(
  "/login",
  viewController.redirectIfLogin,
  viewController.loginViewController
);

router.get(
  "/signUp",
  viewController.redirectIfLogin,
  viewController.signUpViewController
);

router.use(viewController.redirectIfNotLogin);

router.get("/", viewController.homeViewController);

router.get(
  "/myProfile",
  viewController.setProfileCurrentUserId,
  viewController.profileViewController
);
router.get("/profile/:id", viewController.profileViewController);
router.get("/jobs", viewController.jobsViewController);

module.exports = router;
