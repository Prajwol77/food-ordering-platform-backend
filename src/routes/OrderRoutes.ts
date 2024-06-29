import express from "express";
import { jwtParse } from "../middleware/auth";
import { createCheckoutSession } from "../Controllers/OrderController";

//? /api/order/checkout

const router = express.Router();

router.post(
  "/create-checkout-session",
  jwtParse,
  createCheckoutSession
);
export default router;
