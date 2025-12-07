import joi from "joi";
import { genderEnum, roleEnum} from "../../db/models/user.model.js";
import { generalFields } from "../../middlewares/validation.middleware.js"



export const signupSchema= {
    body: joi.object({
  firstName: generalFields.firstName.required(),
  lastName: generalFields.lastName.required(),
  email: generalFields.email.required(),
  password:generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword.required(),
  gender: generalFields.gender.required(),
  phone: generalFields.phone.required(),
  role: joi.string().valid("USER","ADMIN").default(roleEnum.USER),
}),
};


export const loginSchema= {
    body : joi.object({

  email: generalFields.email.required(),
  password: generalFields.password.required(),

}),
};


export const confirmEmailSchema={
body: joi.object({

  email: generalFields.email.required(),
  otp: generalFields.otp.required(),
 
}),
};

export const forgetPasswordSchema ={
  body: joi.object({
    email: generalFields.email.required(),
  }),
};

export const resetPasswordSchema ={
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required(),

  }),
};