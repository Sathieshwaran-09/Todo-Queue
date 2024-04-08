const express= require('express')
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload =require("express-fileupload");
const dbConnection = require("./database/dbConnection.js");
const { errorMiddleware } = require('./middlewares/error.js');
const userRouter = require("./routes/userRouter")
const taskRouter = require("./routes/taskRouter")

const app=express()
dotenv.config({path:"./config/config.env"})

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    method:['GET', 'POST', 'PUT', 'DELETE'],
    credentials:true
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/task", taskRouter);
app.use(errorMiddleware);
dbConnection();

module.exports =app;