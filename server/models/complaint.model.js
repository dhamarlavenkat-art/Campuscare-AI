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
    "Sports",
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
        location: {
            room: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Room",
                default: null
            },
            assetId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            },
            building: {
                type: String,
                trim: true,
                default: ""
            },
            floor: {
                type: Number,
                default: null
            },
            roomNumber: {
                type: String,
                trim: true,
                default: ""
            },
            assetType: {
                type: String,
                trim: true,
                default: ""
            },
            assetName: {
                type: String,
                trim: true,
                default: ""
            },
            affectedQuantity: {
                type: Number,
                min: 1,
                default: 1
            }
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
