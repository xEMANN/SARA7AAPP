import * as dbservice from "../../db/models/dbservice.js";
import usermodel from "../../db/models/user.model.js";
import messagemodel from "../../db/models/message.model.js";
import { successResponse } from "../../utils/successResponse.utils.js";


export const sendmessage = async (req, res, next) => {
  const {content} = req.body;
  const {receiverId } = req.params;

  const user = await dbservice.findById({
    model: usermodel,
    id: receiverId,
  });


  if (!user) return next(new Error("receiver not found",{cause:404}));
  const message = await dbservice.create({
    model: messagemodel,
    data: [
        {
            content,
            receiverId: user._id,
        },
    ],
 });

 return successResponse({
    res,
    statusCode: 201,
    message: "message sent successfully",
    data: { message },
  });
}; 


export const getmessage = async (req, res, next) => {

  const messages = await dbservice.find({
    model: messagemodel,
    populate: [
        {path: "receiverId", select: "firstName lastName email gender -_id"},
    ],
  });


 return successResponse({
    res,
    statusCode: 201,
    message: "message fetched successfully",
    data: { messages },
  });
}; 