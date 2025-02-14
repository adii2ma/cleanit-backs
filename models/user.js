import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 64,
    },
    role: {
      type: String,
      default: "Subscriber",
    },
    roomno: {
      type: String,
      required: true,
    },
    block: {
      type: String,
      required: true,
    },
    requestType: {
      type: String,
      enum: ["Cleaning", "Maintenance","Nothing"], // Specify allowed request types
      default: "Nothing",
      
    },
    status :{
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    image: {
      public_id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export default mongoose.model("User", userSchema);
