import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";
import { fileValidation } from "../../multer/local.multer.js";
import { Types } from "mongoose";

export const profileImageSchema = {
    file: joi
        .object({
            fieldname: generalFields.file.fieldname.valid("profileImage").required(),
            originalname: generalFields.file.originalname.required(),
            encoding: generalFields.file.encoding.required(),
            mimetype: generalFields.file.mimetype
                .valid(...fileValidation.images)
                .required(),
            size: generalFields.file.size.max(5 * 1024 * 1024),
            destination: generalFields.file.destination.required(),
            filename: generalFields.file.filename.required(),
            path: generalFields.file.path.required(),
            finalPath: generalFields.file.finalPath.required(),
        })
        .required(),
};

export const coverImagesSchema = {
    file: joi
        .object({
            fieldname: generalFields.file.fieldname.valid("coverImage").required(),
            originalname: generalFields.file.originalname.required(),
            encoding: generalFields.file.encoding.required(),
            mimetype: generalFields.file.mimetype
                .valid(...fileValidation.images)
                .required(),
            size: generalFields.file.size.max(5 * 1024 * 1024),
            destination: generalFields.file.destination.required(),
            filename: generalFields.file.filename.required(),
            path: generalFields.file.path.required(),
            finalPath: generalFields.file.finalPath.required(),
        })
        .required(),
};

export const freezeAccountSchema = {
    params: joi.object({
        userId: generalFields.id,
    }),
};

export const restoreAccountSchema = {
    params: joi.object({
          userId: generalFields.id.custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error("any.custom");
      }
      return value;
    }).required(),
  }),
};