import { model } from "mongoose";
import { OrderSchema, OrderedBookSchema } from "../schemas/order-schema";

const Order = model("orders", OrderSchema);
const OrderedBook = model("orderedBooks", OrderedBookSchema);

export class OrderModel {
  // 관리자 전체 주문 조회
  async findAll() {
    const orders = await Order.find({})
      .select("totalPrice totalQuantity status createdAt")
      .populate({ path: "userId", select: "fullName" })
      .populate({
        path: "orderedBooks",
        populate: { path: "bookId", select: "title" },
      });
    return orders;
  }

  // userId로 유저 별 주문내역 조회
  async findByUserId(userId) {
    const order = await Order.find({ userId: userId })
      .select("otalPrice totalQuantity status createdAt")
      .populate({ path: "userId", select: "fullName" })
      .populate({
        path: "orderedBooks",
        populate: { path: "bookId", select: "title price image" },
      });
    return order;
  }

  // oderId로 주문 상세 조회
  async findByOrderId(orderId) {
    const order = await Order.findOne({ _id: orderId })
      .populate({
        path: "userId",
        select: "fullName phoneNumber address createdAt",
      })
      .populate({
        path: "orderedBooks",
        populate: { path: "bookId", select: "title price image" },
      });
    return order;
  }

  // 주문 생성
  async createOrder(orderInfo, bookIdList) {
    const order = await Order.create({
      userId: orderInfo.userId,
      fullName: orderInfo.fullName,
      phoneNumber: orderInfo.phoneNumber,
      address: orderInfo.address,
      deliveryMessage: orderInfo.deliveryMessage,
      totalPrice: orderInfo.totalPrice,
      totalQuantity: orderInfo.totalQuantity,
      orderedBooks: bookIdList,
    });
    return order;
  }

  // 주문 상세 생성
  async createOrderDetail(orderedBookData) {
    const orderedBook = await OrderedBook.create(orderedBookData);
    return orderedBook;
  }

  // 주문 삭제
  async deleteOrder(orderId) {
    await Order.findOneAndDelete({ _id: orderId });
  }

  // 주문 상세 삭제
  async deleteOrderDetail(orderedBookId) {
    await OrderedBook.findOneAndDelete({ _id: orderedBookId });
  }

  // 주문 상태 변경
  async update(orderId, status) {
    const filter = { _id: orderId };
    const update = { status: status };
    const option = {
      returnOriginal: false,
    };

    const order = await Order.findOneAndUpdate(filter, update, option);
    return order;
  }
}

const orderModel = new OrderModel();
export { orderModel };
