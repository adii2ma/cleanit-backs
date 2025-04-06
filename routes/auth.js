import express from "express";
import User from "../models/user.js";
import { signup, signin, request, status, verified, saveReview } from "../controllers/auth.js"; // Use ES imports

const router = express.Router();

router.get("/", (req, res) => {
    return res.json({
        data: "hello world from the API"
    });
});

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/request", request);
router.post("/status", status);
router.post("/verified", verified);
router.post("/review", saveReview);
router.get("/status", async (req, res) => {
    try {
        const email = req.session.userEmail;
        if (!email) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Find user with either cleaning or maintenance request
        const userRequest = await User.findOne({ 
            email, 
            $or: [
                { requestType: "Cleaning" },
                { requestType: "Maintenance" }
            ]
        }).select("name roomno email status verified review requestType");

        if (!userRequest) {
            return res.json({ success: false, message: "No requests found for this user" });
        }

        // Determine which type of request to return based on requestType
        const requestType = userRequest.requestType.includes("Maintenance") ? "Maintenance" : "Cleaning";
        
        // Create a properly structured response
        if (requestType === "Maintenance") {
            // For maintenance requests, return the user object with the correct structure
            const maintenanceData = {
                ...userRequest.toObject(),
                status: userRequest.status?.maintenance || "pending"
            };
            
            console.log("Returning maintenance data:", maintenanceData);
            res.json({ success: true, user: maintenanceData });
        } else {
            // For cleaning requests, return the cleaning request object
            const cleaningData = {
                ...userRequest.toObject(),
                status: userRequest.status?.cleaning || "pending"
            };
            
            res.json({ success: true, cleaningRequest: cleaningData });
        }
    } catch (err) {
        console.error("Error fetching user status:", err);
        res.status(500).json({ error: "Failed to fetch status" });
    }
});

export default router; 
