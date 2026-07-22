const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    resetOTP: {
    type: String,
    default: null
},
resetOTPExpire: {
    type: Date,
    default: null
},
    role:{
        type:String,
        enum:["student","admin"],
        default:"student"
    },
    department: {
      type: String,
      enum: [
        "Administration",
        "IT",
        "Library",
        "Hostel",
        "Transport",
        "Examination",
        "Maintenance",
        "Accounts",
        "Sports",
        "Placement",
        "Security",
      ],
      default: null,
    },
},
    {
        timestamps:true
    }
);

module.exports = mongoose.model("User",userSchema);
