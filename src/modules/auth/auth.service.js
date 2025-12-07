import UserModel, {genderEnum, providerEnum } from "../../db/models/user.model.js";
import { successResponse } from "../../utils/successResponse.utils.js";
import * as dbService from "../../db/models/dbservice.js"
import { assymmetricEncrypt } from "../../utils/Encryption/encryption.utils.js";
import {hash } from "../../utils/Hashing/hashing.utils.js";
import { compare } from "../../utils/Hashing/hashing.utils.js";
import { emailSubject, sendEmail } from "../../utils/Emails/email.utils.js";
import { eventEmitter } from "../../utils/Events/email.event.utils.js";
import { customAlphabet } from "nanoid";
import {v4 as uuid} from "uuid"
import { generateToken } from "../../utils/tokens/token.utils.js";
import { verifyToken } from "../../utils/tokens/token.utils.js";
import TokenModel from "../../db/models/token.model.js";
import { OAuth2Client } from "google-auth-library";
import { getNewLoginCredientials } from "../../utils/tokens/token.utils.js";


export const signup = async (req, res , next) => {
  try {
    const { firstName, lastName, email, password,  gender, phone } = req.body;

    const checkUser = await dbService.findOne({
       model: UserModel,
       filter: { email },
    });

    if (checkUser) {
      return next(new Error("user already exists", {cause: 409}));
    }

  
   
    const encryptedData = assymmetricEncrypt(phone);
    const hashedPassword = await hash({plaintext:password});

    const otp = customAlphabet("0123456qwertyuioasdfghjk",6)();
    const otpExpiresTime  = new Date(Date.now() + 2 * 60 * 1000);
    const hashedOTP = await hash({ plaintext: otp });

    const user = await dbService.create({
      model: UserModel,
      data : [
       {
         firstName,
         lastName,
         email,
         password : await hash ({ plaintext:password}),
         gender,
         phone : assymmetricEncrypt(phone),
         confirmEmailOTP: hashedOTP,
         confirmEmailOTPExpires: otpExpiresTime,
       },
     ], 
  });

  eventEmitter.emit("confirmEmail", {to : email, otp , firstName});

    return successResponse({
        res, 
        statusCode:201,
        message: "user created successfully",
        data: {user}});

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message || error,
    });
  }
};


export const login = async (req, res , next) => {
    const { email, password } = req.body;

   
    const checkUser = await dbService.findOne({
        model : UserModel,
        filter: { email },
    });

    if (!checkUser) {
       return next(new Error("user not found", {cause: 404}));
    }

   
    const isMatch = await compare({ plaintext: password, hash: checkUser.password });
    if (!isMatch) {
        return next(new Error("invalid email or password", { cause: 400 }));
    }

   const creidentials = await getNewLoginCredientials(checkUser);

   return successResponse({
        res, 
        statusCode: 200,
        message: "user loggedin successfully",
        data: { creidentials},
   });
};

export const confirmEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const checkUser = await dbService.findOne({
            model: UserModel,
            filter: {
                email,
                confirmEmail: { $exists: false }, 
                confirmEmailOTP: { $exists: true },
                confirmEmailOTPExpires: { $gt: new Date() }

            },
        });

        if (!checkUser) {
            return next(new Error("user not found or email already confirmed or OTP expired", { cause: 404 }));
        }

        const isMatch = await compare({ plaintext: otp, hash: checkUser.confirmEmailOTP });
        if (!isMatch) {
            return next(new Error("invalid OTP", { cause: 400 }));
        }

        await dbService.updateOne({
            model: UserModel,
            filter: { email },
            data: {
                confirmEmail: new Date(),
                $unset: { confirmEmailOTP: true, confirmEmailOTPExpires: true },
                $inc: { __v: 1 },
            },
        });

        return successResponse({
            res,
            statusCode: 200,
            message: "email confirmed successfully",
        });

    } catch (error) {
        return res.status(500).json({
            message: "something went wrong",
            error: error.message || error,
        });
    }
};

export const logout = async (req, res, next) => {
  try {

    const decoded = req.decoded;  

    await dbService.create({
      model: TokenModel,
      data: [
        {
          jwtid: decoded.jti,
          expiresIn: new Date(decoded.exp * 1000),
          userId: decoded.id
        },
      ]
    });

    return successResponse({
      res,
      statusCode: 200,
      message: "logged out successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "something went wrong",
      error: error.message || error,
    });
  }
};


export const refreshToken = async (req, res, next) => {
  const user = req.user;

  const creidentials = await getNewLoginCredientials(user);

  return successResponse({
    res,
    statusCode: 200,
    message: "token refreshed successfully !! ",
    data: { accessToken },
  });
};


export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const otp = await customAlphabet("0123456789zxcvbnm", 6)();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { email },
    data: {
      forgetPasswordOTP: await hash({ plaintext: otp }),
      forgetPasswordOTPExpires: otpExpires,
    },
    options: { new: true },
  });

  if (!user)
    return next(new Error("user not found", { cause: 404 }));

  eventEmitter.emit("forgetPassword", { to: email, otp, firstName: "" });

  return successResponse({
    res,
    statusCode: 200,
    message: "check your email for the OTP!",
  });
};


export const resetPassword= async (req, res, next) => {
  const {email, otp, password} = req.body;

  const user = await dbService.findOne({
    model: UserModel,
    filter:{
      email,
    
    }
  });
  if (!user) return next(new Error("invalid-account", {cause: 404}));

  console.log("OTP from request:", otp);
  console.log("OTP stored in DB:", user.forgetPasswordOTP);
  if (!(await compare({ plaintext: otp, hash: user.forgetPasswordOTP })))
    return next(new Error("invaid otp", { cause: 400 }));





  await dbService.updateOne({
    model : UserModel,
    filter:{email},
    data:{
      password:await hash ({plaintext: password}),
      $unset: {forgetPasswordOTP: true},
      $inc: {__v:1},
  
    },

  });

  return successResponse({
    res,
    statusCode: 200,
    message: "password reset successfully",
  });
};

async function verifyGoogleAccount({idToken}) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });

  const payload=ticket.getPayload();
  return payload;
}

export const loginwithGoogle= async (req, res, next) => {
  const {idToken} = req.body;

  const {email, email_verified,given_name,family_name,picture} =
    await verifyGoogleAccount({idToken});


  if (!email_verified)
    return next (new Error("email not verfied", {cause:401}));

  const user = await dbService.findOne({
    model : UserModel,
    filter: {email},
  });

  if (user){
     if (user.provider===providerEnum.GOOGLE){
      const creidentials = await getNewLoginCredientials(user);


   return successResponse({
        res, 
        statusCode: 200,
        message: " logged successfully",
        data: { accessToken , refreshToken }
   });
  }
   
     
}

 const newUser = await dbService.create({
  model: UserModel,
  data: [
    {
      firstName: given_name,
      lastName: family_name,
      email,
      confirmEmail: Date.now(),
      provider: providerEnum.GOOGLE,
    },
  ],
 });


const accessToken = generateToken({
  payload: { id: newUser._id.toString(), email: newUser.email },
  secretKey : process.env.TOKEN_ACCESS_SECRET,
  options : {
     expiresIn:parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
     issuer:"http://localhost:3000",
     audience:"http://localhost:4000",
     jwtid: uuid(),
      }
    });


const refreshToken = generateToken({
   payload: { id: newUser._id.toString(), email:newUser.email },
   secretKey : process.env.TOKEN_REFRESH_SECRET,
   options : {
       expiresIn:parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
       issuer:"http://localhost:3000",
       audience:"http://localhost:4000",
       jwtid: uuid(),
      }
    });


  return successResponse({
    res,
    statusCode: 200,
    message: "login successfully",
    data: {accessToken,refreshToken},
  });
};
