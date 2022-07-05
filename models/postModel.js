const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Post must belong to an user"],
    },
    content: {
      type: String,
      trim: true,
    },
    image: String,
    datePosted: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.pre("save", async function (next) {
  if (!this.content && !this.image)
    return next(new AppError("Your post can not be empty", 400));
  next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
