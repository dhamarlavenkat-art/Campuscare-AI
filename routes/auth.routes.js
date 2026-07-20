const express = require("express");
const router = express.Router();


const {registerUser,loginUser, forgotPassword, verifyOTP, resetPassword} = require("../controllers/auth.controller");
const authLimiter = require("../middleware/rateLimit.middleware")
router.post("/register",authLimiter,registerUser);
router.post("/login",authLimiter,loginUser);
router.post("/forgot-password",authLimiter,forgotPassword)
router.post("/verify-otp",verifyOTP)
router.post("/reset-password",resetPassword)



module.exports=router