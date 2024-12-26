import User from "../models/user.js";
import bcrypt from "bcrypt";


import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

export const hashPassword = (password) => {
  return new Promise((resolve,reject) => {
      bcrypt.genSalt(12,(err,salt)=>{
          if(err) {
              reject(err);
          }
          bcrypt.hash(password, salt, (err,hash) => {
              if(err){
                  reject(err);
              }
              resolve(hash);
          });
      });
  });
};
export const comparePassword = (password,hashed) => {
  return bcrypt.compare(password,hashed);
};

export const signup = async (req, res) => {
  console.log("Signup Hit");

  try {
    // validation
    const { name, email, password, roomno, block } = req.body;

    if (!name) {
      return res.json({ error: "Name is required" });
    }

    if (!email) {
      return res.json({ error: "Email is required" });
    }

    if (!password || password.length < 6) {
      return res.json({ error: "Password is required and should be 6 characters long" });
    }

    if (!roomno || roomno.length > 4) {
      return res.json({ error: "Room number is required and should be 4 digits or less" });
    }

    if (!block || block.length !== 1) {
      return res.json({ error: "Block is required and should be a single character" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ error: "Email is taken" });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    try {
      const user = await new User({
        name,
        email,
        password: hashedPassword,
        roomno,
        block,
      }).save();

      // create signed token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      const { password, ...rest } = user._doc;

      return res.json({
        token,
        user: rest,
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if our db has user with that email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "No user found" });
    }

    // check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({ error: "Wrong password" });
    }

    // create signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.password = undefined;

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roomno: user.roomno,
        block: user.block, // Include roomno and block in the response
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};
export const request = async (req, res) => {
  try {
    const { type } = req.body;

    // Validate input
    if (!type) {
      return res.status(400).json({ error: "Type is required" });
    }

    // Check if the provided type is valid
    if (!["cleaning", "maintenance"].includes(type)) {
      return res.status(400).json({ error: "Invalid type provided" });
    }

    // Extract the email from the JWT token
    const token = req.headers.authorization?.split(" ")[1]; // Assuming "Bearer <token>"
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    if (!email) {
      return res.status(401).json({ error: "Invalid token. User email not found." });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the type field in the user document
    user.type = type;
    await user.save();

    res.json({
      success: true,
      message: `Request type updated to '${type}' for user '${email}'`,
    });
  } catch (err) {
    console.error("Error updating request type:", err);
    res.status(500).json({ error: "Failed to update request type" });
  }
};