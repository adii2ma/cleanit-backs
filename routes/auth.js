import express from "express";
import User from "../models/user.js";
import { signup, signin, request, status, verified } from "../controllers/auth.js"; // Use ES imports

const router = express.Router();

router.get("/", (req, res) => {
    return res.json({
        data: "hello world from the API"
    });
});

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/request",request);
router.post("/status",status);
router.post("/verified", verified);
router.get("/status", async (req, res) => {
    try {
        
        const email = req.session.userEmail;
        if (!email) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

     
        const userRequest = await User.findOne({ email, requestType: "Cleaning" }).select("name roomno email status");

        if (!userRequest) {
            return res.json({ success: false, message: "No cleaning request found for this user" });
        }

        res.json({ success: true, cleaningRequest: userRequest });
    } catch (err) {
        console.error("Error fetching user status:", err);
        res.status(500).json({ error: "Failed to fetch status" });
    }
});

export default router; 
