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







































module.exports={
    registerUser,
    loginUser
};
