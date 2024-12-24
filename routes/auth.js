import express from "express";
import { signup, signin, cleanreq, maintainreq} from "../controllers/auth.js"; // Use ES imports

const router = express.Router();

router.get("/", (req, res) => {
    return res.json({
        data: "hello world from the API"
    });
});

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/cleaningrequest",cleanreq);
router.post("/maintaingrequest",maintainreq);
export default router; 
