const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user.model");

dotenv.config();

const createSuperAdmin = async () => {
    const name = process.env.SUPER_ADMIN_NAME?.trim();
    const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!process.env.MONGO_URL || !name || !email || !password) {
        throw new Error(
            "Set MONGO_URL, SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in server/.env"
        );
    }
    if (password.length < 8) {
        throw new Error("SUPER_ADMIN_PASSWORD must contain at least 8 characters");
    }

    await mongoose.connect(process.env.MONGO_URL);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
        { email },
        {
            $set: {
                name,
                password: hashedPassword,
                role: "super_admin",
                department: null
            }
        },
        { new: true, upsert: true, runValidators: true }
    );

    console.log(`Super Admin ready: ${user.email}`);
};

createSuperAdmin()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
