import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TImageFiles } from "../../interface/image.interface";
import { getExistingShopById } from "../shop/shop.utils";
import { TProduct } from "./product.interface";
import { Product } from "./product.model";
import { getExistingProductCategoryById } from "../productCategory/productCategory.utils";

const createProduct = async (payload: TProduct, images: TImageFiles) => {
  const existingShop = await getExistingShopById(payload.shop.toString());

  if (!existingShop) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  const existingProductCategory = await getExistingProductCategoryById(
    payload.category.toString()
  );

  if (!existingProductCategory) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  payload.shop = existingShop._id;
  payload.category = existingProductCategory._id;

  const { productImages } = images;

  if (productImages && productImages.length > 0) {
    payload.imageUrls = productImages.map((image) => image.path);
  }

  const result = await Product.create(payload);

  return result;
};

export const ProductService = {
  createProduct,
};
