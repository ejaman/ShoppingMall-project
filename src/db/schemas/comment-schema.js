import { Schema } from "mongoose";

const CommentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export { CommentSchema };
