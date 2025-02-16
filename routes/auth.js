import express from "express";
import { signup, signin, request, status} from "../controllers/auth.js"; // Use ES imports

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
router.get("/status", async (req, res) => {
    try {
      const cleaningRequests = await User.find({ requestType: "Cleaning" }).select("name roomno email status");
      res.json({ success: true, cleaningRequests });
    } catch (err) {
      console.error("Error fetching status:", err);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });
  
export default router; 
