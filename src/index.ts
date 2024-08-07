import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoutes";
import { v2 as cloudinary } from "cloudinary";
import myRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import authRoute from "./routes/AuthRoute";
import orderRoute from "./routes/OrderRoutes";
import { submitComment } from "./CommentFilter";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to Database"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "Health OK!" });
});
app.post("/api/submit-comment", async (req, res) => {
  try {
    const { userId, restaurantId, comment } = req.body;
    const result = await submitComment(userId, restaurantId, comment);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api/auth", authRoute);
app.use("/api/order/checkout", orderRoute);

app.listen(7000, () => {
  console.log("Server running on localhost 7000 ");
});
