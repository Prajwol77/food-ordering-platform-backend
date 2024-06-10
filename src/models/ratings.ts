import { Schema, model } from "mongoose";

const ratingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  itemId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  ratingValue: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Ratings = model("Rating", ratingSchema);
export default Ratings;
