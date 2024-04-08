const User = require("../models/userSchema.js");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors.js");
const { ErrorHandler } = require("../middlewares/error.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");

const register = catchAsyncErrors(async (req, res, next) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("User Avatar Required!", 400));
      }
      const { avatar } = req.files;
      const allowedFormats = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/avif",
      ];
      if (!allowedFormats.includes(avatar.mimetype)) {
        return next(
          new ErrorHandler(
            "Please provide avatar in png,jpg,webp or avif format!",
            400
          )
        );
      }

      const { name, email, phone } = req.body;
      if (!name || !email || !phone || !req.body.password) {
        return next(new ErrorHandler("Please fill full form!", 400));
      }

      let user = await User.findOne({ email });
      if (user) {
        return next(new ErrorHandler("User already exists!", 400));
      }

      const salt= await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hashSync(req.body.password, salt)

      const cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath
      );
      if (!cloudinaryResponse || cloudinary.error) {
        console.error(
          "Cloudinary Error:",
          cloudinaryResponse.error || "Unknown cloudinary error!"
        );
      }

      user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        avatar: {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        },
      });

      const token = jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRES});
      const {password, ...info} = user._doc;
      res.cookie("token", token,{
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly:true,
      }).status(200).json({message:"User Registered Successfully"})
});

const login = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    if (!email || !req.body.password) {
      return next(new ErrorHandler("Please provide email and password!", 400));
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("Invalid email  or password!", 400));
    }
    const isPasswordMatched = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email  or password!", 400));
    }
    
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRES});
    const {password, ...info} = user._doc;
    res.cookie("token", token,{
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly:true,
    }).status(200).json({message:"User Logged in Successfully"})
  });

const logout = catchAsyncErrors(async (req, res, next) => {
    res.clearCookie('token',{sameSite:"none", secure:true}).status(200).json({
        success: true,
        message: "User Logged out Successfully",
    })
});

const myProfile = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
  });
});

module.exports = {
    register,
    login,
    logout,
    myProfile
}