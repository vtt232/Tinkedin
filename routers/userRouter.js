const express = require("express");

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signUp", authController.signUp);
router.post("/login", authController.login);

router.use(authController.protect);
router.patch("/follow/:id", userController.followUser);
router.patch("/unfollow/:id", userController.unfollowUser);
router.get("/logout", authController.logout);
router.get("/me", authController.getMe);
router.patch(
  "/me",
  userController.uploadImages,
  userController.resizeAndStoreAvatar,
  userController.resizeAndStoreBackground,
  userController.updateMe
);
router.patch(
  "/me/resume",
  userController.uploadResume,
  userController.updateResume
);

module.exports = router;
