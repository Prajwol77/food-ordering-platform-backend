import express from "express";
import multer from "multer";
import MyRestaurantController from "../Controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";
import { updateReview } from "../Controllers/RatingsController";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);
// /api/my/restaurant
router.post(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,

  MyRestaurantController.createMyRestaurant,
);

router.put(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateMyRestaurant,
);

router.get("/getAllMyRestaurant", jwtCheck, jwtParse, MyRestaurantController.getAllMyRestaurant);
router.get("/getRestaurantById", jwtCheck, jwtParse, MyRestaurantController.getRestaurantById);
router.delete("/deleteRestaurant", jwtCheck, jwtParse, MyRestaurantController.deleteRestaurant);

router.get("/allUserAndRestaurant", jwtCheck, jwtParse, MyRestaurantController.allUserAndRestaurant);

router.put("/rating", jwtCheck, jwtParse, updateReview);


export default router;
