import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import mongoose from "mongoose";
import morgan from "morgan";

const app = express();

mongoose
    .connect(process.env.DATABASE)
    .then(() => console.log("DB connected"))
    .catch((err) => console.log("DB connection error: ", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

app.use("/api", authRoutes);

app.listen(8000, () => console.log("Server running on port 8000"));
