const {analyzeComplaint}=require("../services/ai.service");
const Complaint = require("../models/complaint.model");


const createComplaint = async(req,res)=>{
    try{
        const {
            title,
            description,
            anonymous
        } = req.body;
        // AI Analysis
    const aiResult = await analyzeComplaint(title, description);

    const {
        category,
        priority,
        department,
        summary,
        troubleshooting
        } = aiResult;
        const image = req.file ? req.file.filename : "";

        const complaint = await Complaint.create({
            title,
            description,
            category,
            priority,
            department,
            summary,
            troubleshooting,
            anonymous,
            image,
            createdBy: req.user.id,
            

        history: [
        {
            action: "Complaint Created",
            status: "Pending",
            remark: "",
            updatedBy: "Student"
        }
    ]
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

const getMyComplaints = async(req,res)=>{
    try{
        const complaints = await Complaint.find({
            createdBy:req.user.id
        }).sort({createdAt:-1});
        res.status(200).json({
            success:true,
            count:complaints.length,
            data:complaints
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const getComplaintById = async(req,res)=>{
    try{
        const complaint = await Complaint.findById(req.params.id);
        if(!complaint){
            return res.status(404).json({
                success:false,
                message:"Complaint Not Found"
            });
        }
        //Security :User can only view their own complaints
        if(complaint.createdBy.toString() !== req.user.id){
            return res.status(403).json({
                success:false,
                message:"Access Denied"
            });
        }
        res.status(200).json({
            success:true,
            data:complaint
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const updateComplaint = async(req,res)=>{
    try{
        const complaint = await Complaint.findById(req.params.id);
        if(!complaint){
            return res.status(404).json({
                success:false,
                message:"Complaint Not Found"
            });
        }
        //Owner Check
        if(complaint.createdBy.toString() !== req.user.id){
            return res.status(403).json({
                success:false,
                message:"Access Denied"
            });
        }
        //Status check
        if(
            complaint.status === "Resolved" ||
            complaint.status === "Rejected"
        ){
            return res.status(400).json({
                success:false,
                message:"Complaint cannot be updated"
            });
        }
        const updateComplaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true,
                runValidators:true  
            }
        );
        res.status(200).json({
            success:true,
            message:"Complaint Updated Successfully",
            data:updateComplaint
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const deleteComplaint = async(req,res)=>{
    try{
        const complaint = await Complaint.findById(req.params.id);
        if(!complaint){
            return res.status(404).json({
                success:false,
                message:"Complaint Not Found"
            });
        }
        //Owner Check
        if(complaint.createdBy.toString() !== req.user.id){
            return res.status(403).json({
                success:false,
                message:"Access Denied"
            });
        }
        //Prevent deleting resolved complaints
        if(complaint.status === "Resolved"){
            return res.status(400).json({
                success:false,
                message:"Resolved complaints cannot be deleted"
            });
        }
        await Complaint.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success:true,
            message:"Complaint Deleted Successfully"
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const getComplaintHistory = async(req,res)=>{
    try{
        const complaint = await Complaint.findById(req.params.id);
        if(!complaint){
            return res.status(404).json({
                success:false,
                message:"Complaint Not Found"
            });
        }
        res.status(200).json({
            success:true,
            count:complaint.history.length,
            history:complaint.history
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};











module.exports ={
    createComplaint,
    getMyComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint,
    getComplaintHistory
};