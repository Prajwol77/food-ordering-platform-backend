import express from "express";
import { jwtParse } from "../middleware/auth";
import {
  cashOnDelivery,
  createCheckoutSession,
  getMyOrders,
} from "../Controllers/OrderController";
import createKhaltiCheckOutSession from "../Controllers/KhaltiController";

//? /api/order/checkout

const router = express.Router();

router.get("/", jwtParse, getMyOrders);

router.post("/create-checkout-session", jwtParse, createCheckoutSession);

router.post(
  "/create-khalti-checkout-session",
  jwtParse,
  createKhaltiCheckOutSession
);
router.post("/cashOnDelivery", jwtParse, cashOnDelivery)

export default router;
