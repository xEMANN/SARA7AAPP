import * as dbService from "../../db/models/dbservice.js";
import UserModel from "../../db/models/user.model.js";
import { assymmetricDecrypt} from "../../utils/Encryption/encryption.utils.js";
import { successResponse } from "../../utils/successResponse.utils.js";
import { verifyToken } from "../../utils/tokens/token.utils.js";
import { login } from "../auth/auth.service.js";
import TokenModel from "../../db/models/token.model.js";
import { cloudinaryConfig } from "../../multer/cloudinary.config.js";
import { Types } from "mongoose";



export const listAllUsers = async (req , res, next) => {
    let users = await dbService.find({
        model: UserModel,
    });

    users = users.map((user) => {
        return { ...user._doc, phone : assymmetricDecrypt(user.phone)};
    });
    return successResponse ({
        res,
        statusCode: 200 ,
        message: "user fetched successfully",
        data:(users),

    });
};

export const updateProfile = async (req, res, next) => {
  const { firstName, lastName, gendre } = req.body;
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer "))
    return next(new Error("Invalid Authorization Format", { cause: 400 }));

  const tokenString = authorization.split(" ")[1];

  const decoded = verifyToken(tokenString, process.env.TOKEN_ACCESS_SECRET);

  const revokedToken = await dbService.findOne({
    model: TokenModel,
    filter: { jwtid: decoded.jti },
  });

  if (revokedToken)
    return next(new Error("Token is Revoked", { cause: 400 }));

  const user = await dbService.findByIdAndUpdate({
    model: UserModel,
    id: req.user.id,
    data: { firstName, lastName, gendre, $inc: { __v: 1 } },
    options: { new: true },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "user updated successfully",
    data: user,
  });
};


export const profileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      req.file.path,
      { folder: `SARA7AAPP/users/${req.user._id}` }
    );

    const user = await dbService.findOneAndUpdate({
      model: UserModel,
      filter: { _id: req.user._id },
      data: { cloudProfileImage: { public_id, secure_url } },
    });


    if (req.user.cloudProfileImage?.public_id){
      await cloudinaryConfig().uploader.destroy(
        req.user.cloudProfileImage.public_id
      );
    }

    return successResponse({
      res,
      statusCode: 200,
      message: "Profile Image updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};


export const coverImages = async (req, res, next) => {
  if (req.user.cloudCoverImages && req.user.cloudCoverImages.length > 0) {
    for (let img of req.user.cloudCoverImages) {
      if (img && img.public_id) {
        await cloudinaryConfig().uploader.destroy(img.public_id);
      }
    }
  }

  const attachments = [];
  for (const file of req.files) {
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `SARA7AAPP/users/${req.user._id}`,
      }
    );
    attachments.push({ public_id, secure_url });
  }

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: { cloudCoverImages: attachments },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "cover Image updated",
    data: { user },
  });
};

export const freezeAccount = async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== roleEnum.ADMIN) {
    return next(new Error("You are not authorized to freeze Account"));
  }

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId || req.user._id,
      freezedAt: { $exists: false },
    },
    data: {
      freezedAt: Date.now(),
      freezedBy: req.user._id,
    },
  });

  return updatedUser ? successResponse({
    res,
    statusCode: 200,
    message: "profile freezed successfully",
    data: {user: updatedUser},
  })
  : next(new Error("invalid account"));
};


export const restoreAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const updatedUser = await dbService.findOneAndUpdate({
      model: UserModel,
      filter: {
        _id: userId,
        freezedAt: { $exists: true },
        freezedBy: { $exists: true },
      },
      data: {
        $unset: {
          freezedAt: "",
          freezedBy: "",
        },
        restoredAt: Date.now(),
        restoredBy: req.user._id,
      },
      options: { new: true },
    });

    if (!updatedUser) {
      return next(new Error("No User Found Or User Not Freezed", { cause: 404 }));
    }

    return successResponse({
      res,
      statusCode: 200,
      message: "Profile Restored Successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};
