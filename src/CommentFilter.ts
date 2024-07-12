import mongoose from "mongoose";
import Filter from "bad-words";

const filter = new Filter();

filter.addWords(
  "pathetic",
  "idiot",
  "stupid",
  "moron",
  "handicapped",
  "autistic"
);

const commentSchema = new mongoose.Schema({
  userId: String,
  restaurantId: String,
  ratings: String,
});

const Comment = mongoose.model("Comment", commentSchema);

export const submitComment = async (
  userId: string,
  restaurantId: string,
  comment: string
) => {
  // Clean the comment to replace offensive words with ***
  const cleanedComment = filter.clean(comment);

  const newComment = new Comment({
    userId,
    restaurantId,
    comment: cleanedComment, // Save the cleaned comment
  });

  await newComment.save();
  return { message: "Comment submitted" };
};
