const express = require("express");
const cookieParser = require("cookie-parser");

const errorController = require("./controllers/errorController");
const userRouter = require("./routers/userRouter");
const postRouter = require("./routers/postRouter");
const viewRouter = require("./routers/viewRouter");
const AppError = require("./utils/appError");

const app = express();

app.use(express.json({ limit: process.env.MAX_BODY_REQUEST_SIZE }));
app.use(cookieParser());

app.use(express.static("public"));

app.set("view engine", "pug");
app.set("views", `${__dirname}/public/views`);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/", viewRouter);

app.all("*", async (req, res, next) => {
  return next(new AppError(`Can not found ${req.url}`, 404));
});

app.use(errorController);

module.exports = app;
