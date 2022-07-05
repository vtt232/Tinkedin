const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/userModel");
const handlerFactory = require("../controllers/handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { convertImageToText } = require("./recognizeImage");

const getUser = handlerFactory.getOne(User, "user");

const storage = multer.memoryStorage();
const fileFilter = function (req, file, cb) {
  const fileType = file.mimetype.split("/")[0];
  const { fieldname } = file;
  if (fileType !== "image")
    return cb(
      new AppError(
        `${fieldname} must be an image. Please try another file`,
        400
      ),
      false
    );
  cb(null, true);
};
const upload = multer({ storage, fileFilter });
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/users/resumes");
  },
  filename: function (req, file, cb) {
    const fileName = `user_${req.user.id}_resume.jpg`;
    req.body.resumeImage = fileName;
    cb(null, fileName);
  },
});
const diskUpload = multer({ storage: diskStorage });

const uploadResume = diskUpload.single("resume");

const updateResume = catchAsync(async (req, res, next) => {
  const imagePath = `${__dirname}/../public/img/users/resumes/${req.body.resumeImage}`;
  req.body.resumeString = await convertImageToText(imagePath);

  const user = await User.findByIdAndUpdate(req.user.id, req.body);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

const uploadImages = upload.fields([
  {
    name: "avatar",
    maxCount: 1,
  },
  {
    name: "background",
    maxCount: 1,
  },
]);

const resizeAndStoreAvatar = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  const { avatar } = req.files;
  if (!avatar) return next();
  req.body.avatar = `user_${req.user.id}_avatar.jpg`;
  await sharp(avatar[0].buffer)
    .resize(500, 500)
    .jpeg({ quality: 80 })
    .toFile(`public/img/users/avatars/${req.body.avatar}`);

  next();
});

const resizeAndStoreBackground = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  const { background } = req.files;
  if (!background) return next();

  req.body.background = `user_${req.user.id}_background.jpg`;
  await sharp(background[0].buffer)
    .jpeg({ quality: 70 })
    .toFile(`public/img/users/backgrounds/${req.body.background}`);

  next();
});

const updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

const followUser = catchAsync(async (req, res, next) => {
  const existingUser = await User.findById(req.params.id);

  if (!existingUser)
    return next(new AppError("Can not find user with specified id", 404));

  const alreadyFollowed = req.user.followings.find(
    (id) => id === req.params.id
  );
  if (alreadyFollowed)
    return next(new AppError("You already followed this person", 400));

  req.user.followings.push(req.params.id);
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
  });
});

const unfollowUser = catchAsync(async (req, res, next) => {
  const existingUser = await User.findById(req.params.id);

  if (!existingUser)
    return next(new AppError("Can not find user with specified id", 404));

  const alreadyFollowed = req.user.followings.find(
    (id) => id === req.params.id
  );
  if (!alreadyFollowed)
    return next(
      new AppError("You can unfollow someone you haven't followed yet", 400)
    );

  req.user.followings = req.user.followings.filter(
    (id) => id !== req.params.id
  );
  await User.findByIdAndUpdate({ followings: req.user.followings });

  res.status(200).json({
    status: "success",
  });
});

module.exports = {
  getUser,
  updateMe,
  uploadImages,
  resizeAndStoreAvatar,
  resizeAndStoreBackground,
  uploadResume,
  updateResume,
  followUser,
  unfollowUser,
};
