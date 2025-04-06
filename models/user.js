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
      type: [String],
      enum: ["Cleaning", "Maintenance" ], // Specify allowed request types
      default: [],
      
    },
    status: {
      cleaning: {
        type: String,
        enum: ["pending", "completed", "not_requested"],
        default: "not_requested", // Default if Cleaning is not selected
      },
      maintenance: {
        type: String,
        enum: ["pending", "completed", "not_requested"],
        default: "not_requested", // Default if Maintenance is not selected
      },
    },
    verified:{
      cleaning:{
        type: String,
        enum:["yes","no","not_rep"],
        default:"not_rep",
      
      },
      maintenance:{
        type: String,
        enum:["yes","no","not_rep"],
        default:"not_rep",
        
      }
      
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
