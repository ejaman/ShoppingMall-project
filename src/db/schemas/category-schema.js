import { Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      //unique: true,
    },
  },
  {
    collection: "categories",
    timestamps: true,
  }
);

export { CategorySchema };
