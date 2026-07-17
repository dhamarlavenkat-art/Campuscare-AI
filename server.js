const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/database");
const authRouter = require("./routes/auth.routes")
const authenticateToken = require("./middleware/auth.middleware");
console.log(typeof authenticateToken);
dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRouter);


app.get("/api/profile",authenticateToken,(req,res)=>{
    res.json({
        success:true,
        Message:"Welcome to your profile",
        user:req.user
    });
});

app.get("/",(req,res)=>{
    res.send("CampuscareAI backend was running");
})
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});