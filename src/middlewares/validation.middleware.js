import joi from "joi";
import { genderEnum } from "../db/models/user.model.js";
import { Types } from "mongoose";




export const validation = (Schema) => {
    return (req,res,next) => {
        const validationError = [];
        for (const key of Object.keys(Schema)){
            const validationResults = Schema[key].validate(req[key],{
                abortEarly:false,
            });

            if (validationResults.error) {
                validationError.push({key, details: validationResults.error.details});
            }
        }

        if (validationError.length)
            return res
              .status(400)
              .json({message:"validation error", details:validationError});

        return next();
    };
};

export const generalFields= {
    firstName: joi.string().min(2).max(20).required().messages({
        "string.min": "first namr must be a least 2 characters long",
        "string.max": "first namr must be a least 20 characters long",
        "any.required": "first name is mandatory",
      }),
      lastName: joi.string().min(2).max(20).required().messages({
        "string.min": "first namr must be a least 2 characters long",
        "string.max": "first namr must be a least 20 characters long",
        "any.required": "last name is mandatory",
      }),
      email: joi
      .string()
      .email()
      .required(),
      password: joi.string().required(),
      confirmPassword:  joi
        .string()
        .valid(joi.ref("password"))
        .messages({
          "any.only": "Confirm password does not match password",
  }),

      gender: joi
      .string()
      .valid(...Object.values(genderEnum))
      .default(genderEnum.MALE),
      phone: joi.string().pattern(new RegExp(/^01[0125][0-8]{8}$/)),
      otp : joi.string(),
      id: joi.string().custom((value, helpers) => {
       if (!Types.ObjectId.isValid(value)) {
         return helpers.message("invalid objectid format");
       }
        return value;
      }),


      file: {
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        size: joi.number().positive(),
        destination: joi.string(),
        filename: joi.string(),
        finalPath: joi.string(),
        path: joi.string(),
},

    
};