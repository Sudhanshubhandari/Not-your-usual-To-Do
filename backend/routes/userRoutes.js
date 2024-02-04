import express from "express";
import {
  createUser, getUserById,
} from "../controllers/userController.js";
// import { protectRoute, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(createUser);
router.get('/',getUserById)
// router.post("/login");


export default router;