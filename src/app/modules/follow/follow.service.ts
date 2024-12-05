import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { getExistingUserById } from "../user/user.utils";
import { Follow } from "./follow.model";
import { TFollow } from "./follow.interface";
import QueryBuilder from "../../builder/QueryBuilder";
import { ClientSession } from "mongoose";
import { getExistingShopById } from "../shop/shop.utils";

const getAllFollows = async (query: Record<string, unknown>) => {
  const followQuery = new QueryBuilder(
    Follow.find().populate("follower shop"),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await followQuery.modelQuery;
  const meta = await followQuery.countTotal();

  return {
    meta,
    result,
  };
};

const follow = async (followerId: string, shopId: string) => {
  const follower = await getExistingUserById(followerId);

  if (!follower) {
    throw new AppError(httpStatus.NOT_FOUND, "Follower not found");
  }

  const shop = await getExistingShopById(shopId);

  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  const existingFollow = await Follow.findOne({
    follower: follower,
    shop: shop,
  });

  if (existingFollow) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are already following this shop"
    );
  }

  const payload: TFollow = {
    follower: follower._id,
    shop: shop._id,
  };

  const result = await Follow.create(payload);

  return result;
};

const unfollow = async (followerId: string, shopId: string) => {
  const follower = await getExistingUserById(followerId);

  if (!follower) {
    throw new AppError(httpStatus.NOT_FOUND, "Follower not found");
  }

  const shop = await getExistingShopById(shopId);

  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  const existingFollow = await Follow.findOne({
    follower: follower,
    shop: shop,
  });

  if (!existingFollow) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not currently following this shop"
    );
  }

  const result = await Follow.findByIdAndDelete(existingFollow._id);

  return result;
};

const deleteAllFollows = async (
  userId?: string,
  shopId?: string,
  session?: ClientSession
) => {
  const filter: Record<string, string> = {};
  if (userId) filter.follower = userId;
  if (shopId) filter.shop = shopId;

  const result = await Follow.deleteMany(filter, {
    session: session || undefined,
  });

  return result?.deletedCount || 0;
};

const checkIfUserFollowsShop = async (followerId: string, shopId: string) => {
  const follower = await getExistingUserById(followerId);

  if (!follower) {
    throw new AppError(httpStatus.NOT_FOUND, "Follower not found");
  }

  const shop = await getExistingShopById(shopId);

  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  const result = await Follow.findOne({
    follower: follower,
    shop: shop,
  });

  if (result) {
    return true;
  } else {
    return false;
  }
};

export const FollowService = {
  getAllFollows,
  follow,
  unfollow,
  deleteAllFollows,
  checkIfUserFollowsShop,
};
