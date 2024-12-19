import User from "../models/user.js";
import { hashPassword, comparePassword } from "../helpers/auth.js";

import jwt from "jsonwebtoken";
import CleaningRequest from "../models/Cleaningrequest.js";
import dotenv from "dotenv";
dotenv.config();

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


export const createCleaningRequest = async (req, res) => {
  try {
    const { userId, roomno, block, requestType } = req.body;

    if (!userId || !roomno || !block || !requestType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newRequest = new CleaningRequest({
      userId,
      roomno,
      block,
      requestType,
    });

    await newRequest.save();
    return res.json({ message: "Request created successfully", newRequest });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating request.");
  }
};
