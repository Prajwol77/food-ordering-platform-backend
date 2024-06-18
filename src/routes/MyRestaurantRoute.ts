import express from "express";
import multer from "multer";
import {
  allUserAndRestaurant,
  deleteRestaurant,
  getAllMyRestaurant,
  getRestaurantById,
  getMyRestaurant,
  updateMyRestaurant,
  createMyRestaurant,
} from "../Controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";
import {
  getCommentForRestaurant,
  updateReview,
} from "../Controllers/RatingsController";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

//? /api/my/restaurant

router.get("/", getMyRestaurant);
router.post(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  createMyRestaurant
);

router.put(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  updateMyRestaurant
);

router.get("/getAllMyRestaurant", getAllMyRestaurant);
router.get("/getRestaurantById", getRestaurantById);
router.delete("/deleteRestaurant", deleteRestaurant);

router.get("/allUserAndRestaurant", allUserAndRestaurant);

router.put("/rating", updateReview);

router.get("/getCommentForRestaurant", getCommentForRestaurant);

export default router;
