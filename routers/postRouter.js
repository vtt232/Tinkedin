const express = require("express");

const authController = require("../controllers/authController");
const postController = require("../controllers/postController");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    postController.uploadImage,
    postController.resizeImage,
    postController.setPostCreator,
    postController.createPost
  );

router.delete("/:id", authController.protect, postController.deletePost);

module.exports = router;
