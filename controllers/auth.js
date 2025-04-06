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
    req.session.userEmail = email;

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

    // Check if our DB has a user with that email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "No user found" });
    }

    // Check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({ error: "Wrong password" });
    }

    // Store user email in the session
    req.session.userEmail = email;

    res.json({
      success: true,
      message: "Signin successful!",
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

    if (!["Cleaning", "Maintenance"].includes(type)) {
      return res.status(400).json({ error: "Invalid type provided" });
    }

    // Check if user email is stored in session
    const email = req.session.userEmail;
    if (!email) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

     if(type==="Cleaning"){
      user.requestType=[...new Set([...user.requestType,"Cleaning"])];
      user.status.cleaning="pending";
      

     }
     if(type==="Maintanance"){
      user.requestType=[...new Set([...user.requestType,"Maintanance"])];
      user.status.cleaning="pending";
     }
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
export const status = async (req, res) => {
  try {
    const { email, status } = req.body;

    if (!email || !status || typeof status !== "object") {
      return res.status(400).json({ error: "Valid email and status object are required" });
    }

    // Extract the key dynamically (should be either "cleaning" or "maintenance")
    const statusKey = Object.keys(status)[0]; // e.g., "cleaning" or "maintenance"
    const statusValue = status[statusKey]; // e.g., "completed" or "pending"

    if (!["cleaning", "maintenance"].includes(statusKey)) {
      return res.status(400).json({ error: "Invalid request type provided" });
    }

    if (!["completed", "pending"].includes(statusValue)) {
      return res.status(400).json({ error: "Invalid status provided" });
    }

    console.log(`Updating ${statusKey} status to '${statusValue}' for ${email}`);

    // Find the user and update only the relevant status field
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { [`status.${statusKey}`]: statusValue } }, // Dynamic field update
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: `Status updated to '${statusValue}' for '${statusKey}'`,
      user: updatedUser,
    });

  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

export const verified = async (req, res) => {
  try {
    const { email, verified, type } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (verified !== "yes" && verified !== "no") {
      return res.status(400).json({ error: "Verification status must be 'yes' or 'no'" });
    }

    // Determine the type (cleaning or maintenance)
    const requestType = type ? type.toLowerCase() : "cleaning"; // Default to cleaning if not specified

    if (requestType !== "cleaning" && requestType !== "maintenance") {
      return res.status(400).json({ error: "Request type must be 'cleaning' or 'maintenance'" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize verified object if it doesn't exist
    if (!user.verified) {
      user.verified = {};
    }

    // Update the specific verification field
    user.verified[requestType] = verified;
    await user.save();

    res.json({
      success: true,
      message: `User '${email}' ${requestType} verification status set to '${verified}'`,
      user: {
        email: user.email,
        verified: user.verified
      }
    });
  } catch (err) {
    console.error("Error updating verification status:", err);
    res.status(500).json({ error: "Failed to update verification status" });
  }
}
