import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OrderService } from "./order.service";

const createOrder = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await OrderService.createOrder(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

export const OrderController = {
  createOrder,
};
