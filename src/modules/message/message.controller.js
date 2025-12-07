import {Router} from "express"; 
import * as messageService from "./message.service.js"
import { validation } from "../../middlewares/validation.middleware.js";
import { sendMessagesSchema } from "./message.validation.js";
const router = Router();
router.post("/send-message/:receiverId",validation(sendMessagesSchema), messageService.sendmessage),
router.get("/get-message", messageService.getmessage  )
export default router;

