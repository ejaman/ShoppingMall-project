import { orderModel } from "../db";

class OrderService {
  constructor(orderModel) {
    this.orderModel = orderModel;
  }
  // 전체 주문 조회
  async getOrders() {
    const orders = await this.orderModel.findAll();
    return orders;
  }

  // userId로 유저 별 주문 내역 조회
  async getFindByUserId(orderId) {
    const order = await this.orderModel.findByUserId(orderId);
    return order;
  }

  // orderId로 주문 상세 조회
  async getFindByOrderId(orderId) {
    const order = await this.orderModel.findByOrderId(orderId);
    return order;
  }

  // 주문 추가
  async addOrder(orderInfo) {
    const bookIdList = [];
    for (let i = 0; i < orderInfo.orderedBooks.length; i++) {
      const orderedBook = await this.orderModel.createOrderDetail(
        orderInfo.orderedBooks[i]
      );
      bookIdList.push(orderedBook._id);
    }
    const order = await this.orderModel.createOrder(orderInfo, bookIdList);

    return order;
  }

  // 주문 삭제
  async deleteOrder(orderId) {
    const order = await orderModel.findByOrderId(orderId);
    for (let i = 0; i < order.orderedBooks.length; i++) {
      await this.orderModel.deleteOrderDetail(order.orderedBooks[i]._id);
    }

    await this.orderModel.deleteOrder(orderId);
  }

  // 주문 상태 변경
  async setOrderStatus(orderId, status) {
    const order = await this.orderModel.update(orderId, status);

    return order;
  }
}

const orderService = new OrderService(orderModel);

export { orderService };
