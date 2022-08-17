import { Router } from "express";
import is from "@sindresorhus/is";
import { loginRequired } from "../middlewares";
import { adminRequired } from "../middlewares";
import { orderService } from "../services";

const orderRouter = Router();

// 전체 주문 목록을 가져옴
orderRouter.get("/orderlist", adminRequired, async function (req, res, next) {
  try {
    const orders = await orderService.getOrders();

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

// userId에 해당하는 주문 목록을 가져옴
orderRouter.get(
  "/orders/:userId",
  loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.params.userId;
      const order = await orderService.getFindByUserId(userId);

      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
);

// orderId에 해당하는 주문 목록을 가져옴
orderRouter.get(
  "/orders/order/:orderId",
  loginRequired,
  async function (req, res, next) {
    try {
      const orderId = req.params.orderId;
      const order = await orderService.getFindByOrderId(orderId);

      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
);

// 새로운 주문 추가하는 기능
orderRouter.post("/addorder", loginRequired, async function (req, res, next) {
  try {
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }

    const {
      userId,
      fullName,
      phoneNumber,
      address,
      deliveryMessage,
      totalPrice,
      totalQuantity,
      orderedBooks,
    } = req.body;

    const orderInfo = {
      userId,
      fullName,
      phoneNumber,
      address,
      deliveryMessage,
      totalPrice,
      totalQuantity,
      orderedBooks,
    };

    const order = await orderService.addOrder(orderInfo);

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
});

// 해당 주문을 삭제하는 기능
orderRouter.delete(
  "/orders/:orderId",
  loginRequired,
  async function (req, res, next) {
    try {
      const orderId = req.params.orderId;
      await orderService.deleteOrder(orderId);

      res.status(200).json("해당 주문이 취소되었습니다.");
    } catch (error) {
      next(error);
    }
  }
);

// 주문 상태를 변경하는 기능
orderRouter.patch(
  "/orders/:orderId",
  adminRequired,
  async function (req, res, next) {
    try {
      if (is.emptyObject(req.body)) {
        throw new Error(
          "headers의 Content-Type을 application/json으로 설정해주세요"
        );
      }

      const orderId = req.params.orderId;
      const { status } = req.body;
      const updateStatus = await orderService.setOrderStatus(orderId, status);

      res.status(200).json(updateStatus);
    } catch (error) {
      next(error);
    }
  }
);

export { orderRouter };
