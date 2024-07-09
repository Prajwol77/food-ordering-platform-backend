import mongoose, { InferSchemaType } from "mongoose";

const menuItemsSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

export type MenuItemType = InferSchemaType<typeof menuItemsSchema>;

const restaurantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  restaurantName: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  deliveryPrice: {
    type: Number,
    required: true,
  },
  estimatedDeliveryTime: {
    type: String,
    required: true,
  },
  cuisines: [
    {
      type: String,
      required: true,
    },
  ],
  menuItems: [menuItemsSchema],
  imageUrl: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  numberOfRatings: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
