import mongoose from "mongoose";

const { Schema } = mongoose;

const cleaningRequestSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
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
      enum: ["Cleaning", "Maintenance"], // Specify allowed request types
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

export default mongoose.model("CleaningRequest", cleaningRequestSchema);
