import express from "express";
import { jwtParse } from "../middleware/auth";
import OrderController from "../Controllers/OrderController";

//? /api/order/checkout

const router = express.Router();

router.get("/", jwtParse, OrderController.getMyOrders);

router.post(
  "/create-checkout-session",
  jwtParse,
  OrderController.createCheckoutSession
);
export default router;
