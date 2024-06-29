import { Schema, model } from "mongoose";

const paymentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  restaurantID: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  stripeId: { type: String, required: true },
});

const Payments = model("Payment", paymentSchema);
export default Payments;
