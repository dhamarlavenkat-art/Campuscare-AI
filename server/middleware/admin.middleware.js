const adminMiddleware = (req,res,next)=>{
    if(!["admin", "super_admin"].includes(req.user.role)){
        return res.status(403).json({
            success:false,
            message:"Admin Access Only"
        });
    }
    next();
}

module.exports=adminMiddleware;
