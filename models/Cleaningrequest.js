import mongoose from "mongoose";

const { Schema } = mongoose;

const cleaningRequestSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
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
