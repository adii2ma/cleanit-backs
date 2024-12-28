import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session"; // Import session middleware
import MongoStore from "connect-mongo"; // Use MongoDB to persist sessions
import authRoutes from "./routes/auth.js";
import mongoose from "mongoose";
import morgan from "morgan";

const app = express();

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection error: ", err));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use a secret for signing session ID cookies
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE }), // Persist sessions in MongoDB
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true, // Prevent access to cookies via JavaScript
      secure: false,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); // Enable CORS for your fr
app.use(morgan("dev"));

app.use("/api", authRoutes);

app.listen(8000, () => console.log("Server running on port 8000"));
