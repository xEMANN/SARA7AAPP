import { Router } from "express";
import * as authService from "./auth.service.js"; 
import { authentication, tokenTypeEnum } from "../../middlewares/auth.middleware.js"; 
import { validation } from "../../middlewares/validation.middleware.js";
import { confirmEmailSchema, forgetPasswordSchema, loginSchema,resetPasswordSchema,signupSchema} from "./auth.validation.js";
const router = Router();

router.post("/signup",validation(signupSchema), authService.signup); 
router.post("/login",validation(loginSchema), authService.login);   
router.patch("/confirm-email", validation(confirmEmailSchema), authService.confirmEmail); 
router.post("/revoke-token",authentication({tokenType:tokenTypeEnum.ACCESS}), authService.logout);    
router.post("/refresh-token", authentication({ tokenType: tokenTypeEnum.REFRESH}), authService.refreshToken); 
router.patch("/forget-password",validation(forgetPasswordSchema), authService.forgetPassword); 
router.patch("/reset-password",validation(resetPasswordSchema), authService.resetPassword); 
router.post("/social-login",validation(resetPasswordSchema),
  authService.loginwithGoogle); 
export default router;
