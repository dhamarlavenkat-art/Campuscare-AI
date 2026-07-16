const User = require("../models/user.model");
const bcrypt = require("bcrypt");

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

module.exports={registerUser};
