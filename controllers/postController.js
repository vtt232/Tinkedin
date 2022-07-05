const multer = require("multer");
const sharp = require("sharp");

const handlerFactory = require("./handlerFactory");
const Post = require("../models/postModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const fileType = file.mimetype.split("/")[0];

  if (fileType !== "image")
    return cb(
      new AppError("This is not a valid image. Please try another one", 400),
      false
    );

  cb(null, true);
};

const upload = multer({ storage, fileFilter });
const uploadImage = upload.single("image");

const resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.body.image = `post_${req.user.id}_${Date.now()}.jpeg`;
  const filePath = `public/img/posts/${req.body.image}`;
  await sharp(req.file.buffer).jpeg({ quality: 80 }).toFile(filePath);

  next();
});

const setPostCreator = (req, res, next) => {
  req.body.user = req.user.id;
  next();
};

const createPost = handlerFactory.createOne(
  Post,
  "post",
  ["content", "image", "user"],
  { path: "user" }
);

const getAllPosts = handlerFactory.getAll(Post, "posts");

const deletePost = handlerFactory.deleteOne(Post, "post");

module.exports = {
  createPost,
  uploadImage,
  resizeImage,
  setPostCreator,
  getAllPosts,
  deletePost,
};
