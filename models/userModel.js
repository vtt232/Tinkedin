const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: [true, "Username must be unique"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    validate: {
      validator: function (val) {
        //Password must be at least 10 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
        return val.match(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{10,}$/
        );
      },
      message:
        "Your password is not strong enough. Password must contain at least 10 characters, one uppercase letter, one lowercase letter, one number and one special character",
    },
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  isCompany: {
    type: Boolean,
    required: [
      true,
      "You need to tell us whether you are a job seeker or company recruiter",
    ],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
  },
  website: {
    type: String,
    required: [true, "Website is required"],
  },
  jobTitle: {
    type: String,
    default: "Not specified yet",
  },
  overview: {
    type: String,
    default: "No overview yet",
  },
  name: {
    type: String,
    default: "Anonymous",
  },
  resumeString: String,
  resumeImage: String,
  education: String,
  skills: String,
  avatar: {
    type: String,
    default: "default.jpg",
  },
  background: {
    type: String,
    default: "default.jpg",
  },
  companySize: {
    type: Number,
    validate: {
      validator: function (value) {
        return value > 0;
      },
      message: "Company size must be larger than 0",
    },
  },
  founded: Number,
  followings: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  isLookingForJob: {
    type: Boolean,
    default: true,
  },
});

//DOCUMENT MIDDLEWARES
/**********************************/
//Encrypt password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isNew && !this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 15);
    next();
  } catch (e) {
    throw new Error(e);
  }
});
/**********************************/

//INSTANCE METHODS
/**********************************/
userSchema.methods.verifyPassword = async (
  plainTextPassword,
  hashedPassword
) => {
  try {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  } catch (e) {
    throw new Error(e);
  }
};

userSchema.methods.changedPasswordAfter = function (passwordChangedAt, date) {
  if (!passwordChangedAt) return false;
  return passwordChangedAt.getTime() > date * 1000;
};
/**********************************/

const User = mongoose.model("User", userSchema);

module.exports = User;
