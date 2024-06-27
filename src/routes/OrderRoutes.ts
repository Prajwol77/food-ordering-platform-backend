import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { createCheckoutSession } from "../Controllers/OrderController";

//? /api/order/checkout

const router = express.Router();

router.post(
  "/create-checkout-session",
  createCheckoutSession
);
export default router;
