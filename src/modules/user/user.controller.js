import {Router} from "express";
import * as userService from "./user.service.js";
import { authentication, authorization, tokenTypeEnum } from "../../middlewares/auth.middleware.js";
import { fileValidation, localUpladMulter } from "../../multer/local.multer.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { coverImagesSchema, freezeAccountSchema, restoreAccountSchema} from "./user.validation.js";
import { cloudFileUploadMulter } from "../../multer/cloud.multer.js"; 
import { roleEnum } from "../../db/models/user.model.js";

const router = Router();
router.get("/",userService.listAllUsers);

router.patch(
  "/update",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [roleEnum.USER] }),
  userService.updateProfile
);


router.patch(
  "/profile-Image",
  authentication, authorization({accessRoles: ["USER"]}),
  cloudFileUploadMulter({ validation: [...fileValidation.images] }).single("profileImage"),

  userService.profileImage
);


router.patch("/cover-images" ,authentication,cloudFileUploadMulter({validation: [...fileValidation.images] }).array(
    "coverImages",
    5
),
userService.coverImages
);


router.delete(
  "{/:userId}/freeze-account", authentication({tokenType: tokenTypeEnum.ACCESS}),
authorization({accessRoles:[roleEnum.USER,roleEnum.ADMIN]}), validation(freezeAccountSchema), userService.freezeAccount
);

router.patch(
  "/:userId/restore-account",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [roleEnum.USER, roleEnum.ADMIN] }),
  validation(restoreAccountSchema),
  userService.restoreAccount
);



export default router;
