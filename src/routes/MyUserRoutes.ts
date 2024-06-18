import express from "express";
import {
  createCurrentUser,
  deleteUser,
  getAllUser,
  getCurrentUser,
  makeUserAdmin,
  updateCurrentUser,
} from "../Controllers/MyUserController";
import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

//? /api/my/user

router.get("/", getCurrentUser);
router.post("/", createCurrentUser);
router.put("/", validateMyUserRequest, updateCurrentUser);
router.get("/getAllUsers", getAllUser);
router.delete("/deleteUser", deleteUser);
router.put("/makeUserAdmin", makeUserAdmin);

export default router;
