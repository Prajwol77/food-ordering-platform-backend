import express from "express";
import { jwtParse } from "../middleware/auth";
import {
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

export default router;
