import httpStatus from "http-status";
import { TImageFiles } from "../../interface/image.interface";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ShopService } from "./shop.service";

const createShop = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await ShopService.createShop(
    userId,
    req.body,
    req.files as TImageFiles
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Shop created successfully",
    data: result,
  });
});

export const ShopController = {
  createShop,
};
