const {body,vallidationResult, validationResult} = require("express-validator");

//validation rules
const complaintValidation = [
    body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .bail()
    .isLength({min:5,max:100})
    .withMessage("Title must be between 5 and 100 characters."),
    body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .bail()
    .isLength({min:10})
    .withMessage("Description must be at least 10 characters")
];
//middleware to return validation errors
const validate = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            success:false,
            errors:errors.array()
        });
    }
    next();
};

module.exports={
    complaintValidation,
    validate
};