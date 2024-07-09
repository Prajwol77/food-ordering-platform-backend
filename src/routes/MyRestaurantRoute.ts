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
  getMyRestaurantOrders,
  updateOrderStatus,
  getRestaurantWithoutLogin,
  getOrderHistory,
} from "../Controllers/MyRestaurantController";
import { validateMyRestaurantRequest } from "../middleware/validation";
import {
  deleteRating,
  getCommentForRestaurant,
  updateRatingById,
  updateReview,
} from "../Controllers/RatingsController";
import { jwtParse } from "../middleware/auth";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.get("/order", jwtParse, getMyRestaurantOrders);

//? /api/my/restaurant

router.get("/", jwtParse, getMyRestaurant);
router.post(
  "/",
  jwtParse,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  createMyRestaurant
);

router.patch("/order/:orderId/status", jwtParse, updateOrderStatus);

router.put(
  "/",
  jwtParse,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  updateMyRestaurant
);

router.get("/getAllMyRestaurant", getAllMyRestaurant);
router.get("/getRestaurantById", getRestaurantById);
router.delete("/deleteRestaurant", jwtParse, deleteRestaurant);

router.get("/allUserAndRestaurant", allUserAndRestaurant);

router.put("/rating", jwtParse, updateReview);

router.get("/getCommentForRestaurant", getCommentForRestaurant);

router.put("/updateRatingById", jwtParse, updateRatingById);

router.delete("/deleteRating", jwtParse, deleteRating);

router.get("/getRestaurant", getRestaurantWithoutLogin);

router.get("/getOrderHistory", getOrderHistory);


export default router;
