import mongoose from "mongoose";
import Filter from "bad-words";

const filter = new Filter();

const commentSchema = new mongoose.Schema({
  userId: String,
  restaurantId: String,
  ratings: String,
});

const Comment = mongoose.model("Comment", commentSchema);

export const submitComment = async (userId, restaurantId, comment) => {
  if (filter.isProfane(comment)) {
    throw new Error("Offensive comment detected");
  } else {
    const newComment = new Comment({ userId, restaurantId, comment });
    await newComment.save();
    return { message: "Comment submitted" };
  }
};
