import express from "express";
import bootstrap from "./src/app.controller.js";
import dotenv from "dotenv";
import cors from "cors";
import { loginwithGoogle } from "./src/modules/auth/auth.service.js";
import chalk from "chalk";

dotenv.config({path: "./src/config/.env.dev"});
const app = express();
const port = process.env.PORT ||
console.log(process.env.PORT)

app.use(cors({
  origin: "http://localhost:4200",  
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

app.post('/api/v1/auth/social-login', loginwithGoogle);

await bootstrap(app, express);
app.listen(port, () => {
    console.log(chalk.bgGreen(chalk.black`server is running http://localhost:${port}`));
});