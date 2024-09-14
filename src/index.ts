import express, { Application, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import morgan from "morgan";
import { errorMiddleware } from "./middlewares/ErrorMiddleware.js";
import authRoutes from "./routes/user-routes.js";
import postRoutes from "./routes/post-routes.js";
import cookieParser from "cookie-parser";
// PORT
const PORT = process.env.PORT || 3000;

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/user", authRoutes);
app.use("/api/post", postRoutes);

app.use(errorMiddleware);
app.listen(PORT, () => console.log(`PORT Running ON PORT ${PORT}`));
