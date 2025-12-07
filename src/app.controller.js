import authRouter from "./modules/auth/auth.controller.js"
import userRouter from "./modules/user/user.controller.js"
import messageRouter from "./modules/message/message.controller.js"
import connectdb from "./db/connection.js";
import { globalErrorHandler } from "./utils/errorHandler.utils.js";
import cors from "cors";
import path from "node:path";
import morgan from "morgan";
import { attachRouterWithLogger } from "./utils/logger/logger.utils.js";
import helmet from "helmet";
import { corsOption } from "./utils/cors/cors.util.js";
import rateLimit from "express-rate-limit";


const bootstrap = async (app , express) => {
    app.use(express.json({ limit: "1kb"}));
    app.use(cors(corsOption()));
    app.use(helmet());
    const limiter = rateLimit({
        windowMs: 5 *60* 1000,
        limit: 5,
        message:{
            statusCode: 429,
            message:"too many requests, please try again",
        } ,
        legacyHeaders:false,
    })
    app.use(limiter);
    app.use(morgan());
    await connectdb();

    attachRouterWithLogger(app, "/api/v1/auth", authRouter, "auth.log");
    attachRouterWithLogger(app, "/api/v1/user", userRouter, "users.log");
    attachRouterWithLogger(app, "/api/v1/message", messageRouter, "messages.log");


    app.get("/" , (req , res) => {
        return res.status(200).json({ message : "Done"});
    });

    app.use("/uploads",express.static(path.resolve("./src/uploads")))
    app.use("/api/v1/auth" , authRouter)
    app.use("/api/v1/user" , userRouter)
    app.use("/api/v1/message" , messageRouter)

    app.all("/*dummy" , (req , res) => {
        return res.status(404).json({ message : "No found handler !!!"});
    });

    app.use(globalErrorHandler);
};

export default bootstrap;