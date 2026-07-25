const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role = "student",
            department
        } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        if (!["student", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be student or admin"
            });
        }

        if (role === "admin" && !department) {
            return res.status(400).json({
                success: false,
                message: "Department is required for admin"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            department: role === "admin" ? department : null
        });

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                department: user.department
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                department: user.department
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        user.resetOTP = otp;
        user.resetOTPExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        console.log("================");
        console.log("Password Reset OTP:", otp);
        console.log("================");

        return res.status(200).json({
            success: true,
            message: "OTP generated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.resetOTP) {
            return res.status(400).json({
                success: false,
                message: "No OTP generated"
            });
        }

        if (
            !user.resetOTPExpire ||
            user.resetOTPExpire < Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        if (user.resetOTP !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const {
            email,
            otp,
            newPassword
        } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.resetOTP) {
            return res.status(400).json({
                success: false,
                message: "No OTP generated"
            });
        }

        if (
            !user.resetOTPExpire ||
            user.resetOTPExpire < Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        if (user.resetOTP !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        user.password = await bcrypt.hash(
            newPassword,
            10
        );

        user.resetOTP = null;
        user.resetOTPExpire = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    verifyOTP,
    resetPassword
};