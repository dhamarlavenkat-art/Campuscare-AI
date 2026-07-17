const Complaint = require("../models/complaint.model");

const createComplaint = async(req,res)=>{
    try{
        const {
            title,
            description,
            category,
            priority,
            anonymous
        } = req.body;
        const complaint = await Complaint.create({
            title,
            description,
            category,
            priority,
            anonymous,
            createdBy:req.user.id
        });
        res.status(201).json({
            success:true,
            message:"Complaint Created Successfully",
            data:complaint
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

module.exports ={
    createComplaint
};