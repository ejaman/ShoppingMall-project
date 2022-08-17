import { Schema, SchemaTypes } from "mongoose";
import { categories } from "../../services";
import { CommentSchema } from "./comment-schema";

const BookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    link: {
      type: String,
      required: false,
    },

    image: {
      type: String,
      required: false,
    },

    author: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    pubdate: {
      type: String,
      required: false,
    },
    publisher: {
      type: String,
      required: false,
    },

    isbn: {
      type: String,
    },
    category: {
      type: String,
      required: false,
      default: "없음",
    },
    comments: [CommentSchema],
  },
  {
    collection: "books",
    timestamps: true,
  }
);

export { BookSchema };
