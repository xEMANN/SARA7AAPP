import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const sendMessagesSchema = {
    body: joi.object({
        content: joi.string().min(2).max(500).required(),
     }),

     params: joi.object({
        receiverId: generalFields.id.required(),
     }),
        
 };