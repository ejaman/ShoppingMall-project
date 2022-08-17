import { Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: new Schema(
        {
          postalCode: String,
          address1: String,
          address2: String,
        },
        {
          _id: false,
        }
      ),
      required: true,
    },
    deliveryMessage: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["상품준비중", "상품배송중", "배송완료"],
      default: "상품준비중",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
    },
    orderedBooks: [
      {
        type: Schema.Types.ObjectId,
        ref: "orderedBooks",
        required: true,
      },
      {
        _id: false,
      },
    ],
  },
  {
    collection: "orders",
    timestamps: true,
  }
);

const OrderedBookSchema = new Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "books",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "orderedBooks",
  }
);

export { OrderSchema, OrderedBookSchema };
