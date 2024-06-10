import { Request, Response } from "express";
import Ratings from "../models/ratings";
import Restaurant from "../models/restaurant";
import User from "../models/user";
import { Types } from "mongoose";

const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewStars, restaurantID, userId, comment } = req.body;
    console.log("🚀 ~ updateReview ~ comment:", comment);
    console.log("🚀 ~ updateReview ~ userId:", userId);
    console.log("🚀 ~ updateReview ~ restaurantID:", restaurantID);
    console.log("🚀 ~ updateReview ~ reviewStars:", reviewStars);

    if (!restaurantID) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (typeof reviewStars !== "number" || reviewStars < 1 || reviewStars > 5) {
      return res
        .status(400)
        .json({ message: "Review stars must be a number between 1 and 5" });
    }

    const restaurant = await Restaurant.findById(
      new Types.ObjectId(restaurantID.toString())
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const user = await User.findById(new Types.ObjectId(userId.toString()));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let rating = await Ratings.findOne({ userId, restaurantID });

    if (rating) {
      if (reviewStars) {
        rating.ratingValue = reviewStars;
      }
      if (comment) {
        rating.comment = comment;
      }
      await rating.save();
    } else {
      rating = new Ratings({
        userId,
        restaurantID,
        ratingValue: reviewStars,
        comment,
      });
      await rating.save();
    }

    const ratings = await Ratings.find({ restaurantID });
    const totalRatings = ratings.length;
    const totalStars = ratings.reduce(
      (acc, rating) => acc + rating.ratingValue,
      0
    );
    const averageRating = totalStars / totalRatings;

    restaurant.averageRating = averageRating;
    restaurant.numberOfRatings = totalRatings;
    await restaurant.save();

    res
      .status(200)
      .json({ message: "Rating updated successfully", rating, averageRating });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { updateReview };
