import express from "express";
import { param } from "express-validator";
import { getRestaurant, searchRestaurant } from "../Controllers/RestaurantController";

const router = express.Router();

router.get(
  "/:restaurantId",
  param("restaurantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("RestaurantId parameter must be a valid string"),
  getRestaurant,
);
// /api/restaurant/search/patan
router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City parameter must be a valid string"),
  searchRestaurant,
);
export default router;