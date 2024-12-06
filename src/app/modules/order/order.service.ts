import mongoose from "mongoose";
import { TOrder } from "./order.interface";
import { getExistingUserById } from "../user/user.utils";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { getExistingShopById } from "../shop/shop.utils";
import { getExistingProductById } from "../product/product.utils";
import { Product } from "../product/product.model";
import { Order } from "./order.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { orderSearchableFields } from "./order.constant";

const getAllOrders = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(
    Order.find({ isActive: true }).populate("user shop"),
    query
  )
    .search(orderSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return {
    meta,
    result,
  };
};

const createOrder = async (userId: string, payload: TOrder) => {
  const existingUser = await getExistingUserById(userId);

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const existingShop = await getExistingShopById(payload.shop.toString());

  if (!existingShop) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  payload.user = existingUser._id;
  payload.shop = existingShop._id;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let calculatedTotalPrice = 0;

    for (const item of payload.products) {
      const existingProduct = await getExistingProductById(
        item.product.toString()
      );

      if (!existingProduct) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          `Product with ID: ${item.product} not found`
        );
      }

      if (existingProduct.inventoryCount < item.quantity) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Not enough inventory for product ${item.product}. Available: ${existingProduct.inventoryCount}, Requested: ${item.quantity}`
        );
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        existingProduct._id,
        {
          $inc: { inventoryCount: -item.quantity },
        },
        { session }
      );

      if (!updatedProduct) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `Failed to update inventory of product with ID: ${item.product}`
        );
      }

      calculatedTotalPrice += item.price * item.quantity;
    }

    payload.totalPrice = calculatedTotalPrice;

    if (payload.discount) {
      payload.discount = Math.max(0, payload.discount);
    }

    const result = await Order.create([payload], { session });

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

export const OrderService = {
  getAllOrders,
  createOrder,
};
