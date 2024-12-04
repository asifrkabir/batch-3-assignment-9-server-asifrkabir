import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TImageFiles } from "../../interface/image.interface";
import { getExistingUserById } from "../user/user.utils";
import { TShop } from "./shop.interface";
import { Shop } from "./shop.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { shopSearchableFields } from "./shop.constant";

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

export const ShopService = {
  getShopById,
  getAllShops,
  createShop,
  getShopByOwnerId,
};
