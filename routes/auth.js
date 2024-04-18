import express from "express";
import {
  getAllUsers,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/allUsers", getAllUsers);
router.put("/logout/:token", authenticate, logoutUser);

export default router;
