import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TImageFiles } from "../../interface/image.interface";
import { getExistingUserById } from "../user/user.utils";
import { TShop } from "./shop.interface";
import { Shop } from "./shop.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { shopSearchableFields } from "./shop.constant";
import { getExistingShopById } from "./shop.utils";
import mongoose from "mongoose";
import { FollowService } from "../follow/follow.service";

const getShopById = async (id: string) => {
  const result = await Shop.findOne({ _id: id, isActive: true });

  return result;
};

const getAllShops = async (query: Record<string, unknown>) => {
  const postQuery = new QueryBuilder(Shop.find({ isActive: true }), query)
    .search(shopSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await postQuery.modelQuery;
  const meta = await postQuery.countTotal();

  return {
    meta,
    result,
  };
};

const createShop = async (
  ownerId: string,
  payload: TShop,
  images: TImageFiles
) => {
  const existingOwner = await getExistingUserById(ownerId);

  if (!existingOwner) {
    throw new AppError(httpStatus.NOT_FOUND, "Owner not found");
  }

  payload.owner = existingOwner._id;

  const { logoUrls } = images;

  if (logoUrls && logoUrls.length > 0) {
    payload.logoUrl = logoUrls[0]?.path;
  }

  const result = await Shop.create(payload);

  return result;
};

const updateShop = async (
  shopId: string,
  userId: string,
  payload: Partial<TShop>,
  images: TImageFiles
) => {
  const existingShop = await getExistingShopById(shopId);

  if (!existingShop) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  const existingUser = await getExistingUserById(userId);

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!existingShop.owner.equals(existingUser._id)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to update this shop"
    );
  }

  const { logoUrls } = images;

  // New Logo
  if (logoUrls && logoUrls.length > 0) {
    payload.logoUrl = logoUrls[0]?.path;
  } else if (payload.logoUrl === null) {
    // Remove Logo
    payload.logoUrl = "";
  }

  const result = await Shop.findOneAndUpdate({ _id: shopId }, payload, {
    new: true,
  });

  return result;
};

const deleteShop = async (id: string) => {
  const existingShop = await getExistingShopById(id);

  if (!existingShop) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  //TODO: Make all products inactive when shop deleted

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedShop = await Shop.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    await FollowService.deleteAllFollows(undefined, id, session);

    await session.commitTransaction();
    await session.endSession();

    return deletedShop;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

const getShopByOwnerId = async (ownerId: string) => {
  const existingOwner = await getExistingUserById(ownerId);

  if (!existingOwner) {
    throw new AppError(httpStatus.NOT_FOUND, "Owner not found");
  }

  const result = await Shop.findOne({
    owner: existingOwner._id,
    isActive: true,
  });

  return result;
};

const toggleShopBlacklistStatus = async (
  id: string,
  { isBlacklisted }: { isBlacklisted: boolean }
) => {
  const existingShop = await getExistingShopById(id);

  if (!existingShop) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  //TODO: Make all products inactive when shop is blacklisted

  const result = await Shop.findByIdAndUpdate(
    id,
    { isBlacklisted: isBlacklisted },
    { new: true }
  );

  return result;
};

export const ShopService = {
  getShopById,
  getAllShops,
  createShop,
  updateShop,
  deleteShop,
  getShopByOwnerId,
  toggleShopBlacklistStatus,
};
