const mongoose = require("mongoose");
const complaintSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            required:true,
        },
        category:{
            type:String,
            enum: [
    "Academic",
    "Maintenance",
    "Hostel",
    "IT",
    "Transport",
    "Security",
    "Library",
    "Cafeteria",
    "Other"
],
            default:"Other"
        },
        priority:{
            type:String,
            enum:["Low","Medium","High"],
            default:"Medium"
        },
        department:{
            type:String,
            default:"General"
        },
        summary:{
            type:String,
            default:""
        },
        troubleshooting:[
            {
                type:String
            }
        ],
        status:{
            type:String,
            enum:["Pending","In Progress","Resolved","Rejected"],
            default:"Pending"
        },
        adminRemark: {
            type: String,
            default: ""
        },
        anonymous:{
            type:Boolean,
            default:false
        },
        image:{
            type:String,
            default:""
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        supporters: {
            type: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            supportedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    default: []
},
        history: [
    {
        action: {
            type: String
        },
        status: {
            type: String
        },
        remark: {
            type: String,
            default: ""
        },
        updatedBy: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
    }
],
    },
    
    {
        timestamps:true
    }
);

module.exports=mongoose.model("Complaint",complaintSchema);