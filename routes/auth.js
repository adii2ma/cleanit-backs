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
export default router; 
