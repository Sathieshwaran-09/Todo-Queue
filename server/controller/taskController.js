const Task = require("../models/taskSchema.js");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors.js");
const { ErrorHandler } = require("../middlewares/error.js");

const createTask = catchAsyncErrors(async (req, res, next) => {
  const { title, description } = req.body;
  const createdBy = req.user._id;
  const task = await Task.create({
    title,
    description,
    createdBy,
  });
  res.status(200).json({
    success: true,
    task,
    message: "Task Created",
  });
});

const deleteTask = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) {
    return next(new ErrorHandler("Task not found!", 400));
  }
  await task.deleteOne();
  res.status(200).json({
    success: true,
    message: "Task Deleted!",
  });
});

const updateTask = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let task = await Task.findById(id);
  if (!task) {
    return next(new ErrorHandler("Task not found!", 400));
  }
  task = await Task.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "Task Updated!",
    task,
  });
});

const getMyTask = catchAsyncErrors(async (req, res, next) => {
  const user = req.user._id;
  const tasks = await Task.find({ createdBy: user });
  res.status(200).json({
    success: true,
    tasks,
  });
});

const getSingleTask = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let task = await Task.findById(id);
  if (!task) {
    return next(new ErrorHandler("Task not found!", 400));
  }
  res.status(200).json({
    success: true,
    task,
  });
});

module.exports = {
  createTask,
  deleteTask,
  getMyTask,
  getSingleTask,
  updateTask,
};
