const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User Already Exist"
            });
        }
        //hashed password
        const hashedPassword = await bcrypt.hash(password,10);
        //create user
        const user = await User.create({
            name,
            email,
            password:hashedPassword
        });
        return res.status(201).json({
            success:true,
            message:"user register successfully",
            data:user
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const loginUser = async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user = await User.findOne({ email });
        //check user exists
        if(!user){
            return res.json({
                success:false,
                message:"User not found"
            });
        }
        //compare password
        const isPasswordMatch = await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                success:false,
                message:"Invaild Credentials"
            });
        }
        //generate JWT Token
        const token=jwt.sign(
            {
                id:user._id,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );
        res.status(200).json({
            success:true,
            message:"Login Successful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
            }
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const forgotPassword = async(req,res)=>{
    try{
        const {email}=req.body;
        //check if user exists
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }
        //Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        //Save OTP
        user.resetOTP = otp;
        user.resetOTPExpire = Date.now() + 10 * 60 * 1000; //10 min
        await user.save();

        console.log("================");
        console.log("Password Reset OTP:",otp);
        console.log("=================");
        res.status(200).json({
            success:true,
            message:"OTP generated successfully."
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const verifyOTP = async(req,res)=>{
    const bcrypt = require("bcrypt");
    try{
        const{email,otp}=req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not Found"
            });
        }
        if(!user.resetOTP){
            return res.status(400).json({
                success:false,
                message:"NO OTP generated"
            });
        }
        if(user.resetOTPExpire < Date.now()){
            return res.status(400).json({
                success:false,
                message:"OTP has expired"
            });
        }
        if(user.resetOTP !== otp){
            return res.status(400).json({
                success:false,
                message:"Invaild OTP"
            });
        }
        res.status(200).json({
            success:true,
            message:"OTP verified successfully"
        });

        }catch(error){
            res.status(500).json({
                success:false,
                message:error.message
            });
        }
    };

const resetPassword = async(req,res)=>{
    try{
        const {email,otp,newPassword}=req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }
        if(!user.resetOTP){
            return res.status(400).json({
                success:false,
                message:"NO OTP generated"
            });
        }
        if(user.resetOTPExpire < Date.now()){
            return res.status(400).json({
                success:false,
                message:"OTP has expired"
            });
        }
        if(user.resetOTP !== otp){
            return res.status(400).json({
                success:false,
                message:"Invaild OTP"
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password = hashedPassword;
        //Remove OTP after password Reset
        user.resetOTP = null;
        user.resetOTPExpire=null;
        await user.save();
        res.status(200).json({
            success:true,
            message:"Password reset successfully."
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};




module.exports={
    registerUser,
    loginUser,
    forgotPassword,
    verifyOTP,
    resetPassword
};
