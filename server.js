const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connect } = require("mongoose");
const connectDB = require("./config/database");
const authRouter = require("./routes/auth.routes")

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRouter);

app.get("/",(req,res)=>{
    res.send("CampuscareAI backend was running");
})
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});