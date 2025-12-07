import jwt from "jsonwebtoken";
import { roleEnum} from "../../db/models/user.model.js";
import { v4 as uuid } from "uuid";


export const signatureEnum = {
    ADMIN:"ADMIN",
    USER:"USER"
}

export const generateToken = ({ 
    payload,
    secretKey = process.env.TOKEN_ACCESS_SECRET,
    options = { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
}) => {
    return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey }) => {
  return jwt.verify(token, secretKey);
};


export const getSignature = async ({signatureLevel = signatureEnum.USER}) => {
    let signatures = {accessSignature: undefined, refreshSignature: undefined} ;

    switch(signatureLevel) {
        case signatureEnum.ADMIN:
            signatures.accessSignature= process.env.TOKEN_ACCESS_ADMIN_SECRET;
            signatures.refreshSignature= process.env.TOKEN_REFRESH_ADMIN_SECRET;
            break;
        default:
            signatures.accessSignature= process.env.TOKEN_ACCESS_USER_SECRET;
            signatures.refreshSignature= process.env.TOKEN_REFRESH_USER_SECRET;
            break;

    }

    console.log (signatures);

    return signatures;
};

export const getNewLoginCredientials = async (user)=> {
    const signatures = await getSignature({
        signatureLevel:
        user.role != roleEnum.USER? signatureEnum.ADMIN: signatureEnum.USER,
    });

    const jwtid = uuid();

    const accessToken = generateToken({
  payload: { id: user._id.toString(), email: user.email },
  secretKey : signatures.accessSignature,
  options : {
     expiresIn:parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
     issuer:"http://localhost:3000",
     audience:"http://localhost:4000",
     jwtid,
      }
    });


const refreshToken = generateToken({
   payload: { id: user._id.toString(), email:user.email },
   secretKey : signatures.refreshSignature,
   options : {
       expiresIn:parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
       issuer:"http://localhost:3000",
       audience:"http://localhost:4000",
       jwtid,
      }
    });

    return {accessToken, refreshToken};
}
