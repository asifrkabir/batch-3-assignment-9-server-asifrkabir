import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TImageFiles } from "../../interface/image.interface";
import { getExistingShopById } from "../shop/shop.utils";
import { TProduct } from "./product.interface";
import { Product } from "./product.model";
import { getExistingProductCategoryById } from "../productCategory/productCategory.utils";
import QueryBuilder from "../../builder/QueryBuilder";
import { productSearchableFields } from "./product.constant";
import { getExistingProductById } from "./product.utils";
import { getExistingUserById } from "../user/user.utils";
import { USER_ROLE_ENUM } from "../user/user.constant";

const getProductById = async (id: string) => {
  const result = await Product.findOne({ _id: id, isActive: true });

  return result;
};

const getAllProducts = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(
    Product.find({ isActive: true }).populate("shop category"),
    query
  )
    .search(productSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return {
    meta,
    result,
  };
};

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

const updateProduct = async (
  productId: string,
  userId: string,
  payload: Partial<TProduct>,
  images: TImageFiles
) => {
  const existingProduct = await getExistingProductById(productId);

  if (!existingProduct) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const existingUser = await getExistingUserById(userId);

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const existingShop = await getExistingShopById(
    existingProduct.shop.toString()
  );

  if (!existingShop) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  if (
    existingUser.role === USER_ROLE_ENUM.vendor &&
    existingShop.owner !== existingUser._id
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to update this product"
    );
  }

  let existingImageUrls: string[] = [];
  let newImageUrls: string[] = [];

  if (payload.imageUrls && payload.imageUrls.length > 0) {
    existingImageUrls = payload.imageUrls;
  }

  const { productImages } = images;

  if (productImages && productImages.length > 0) {
    newImageUrls = productImages.map((image) => image.path);
  }

  const finalImageUrls = [...existingImageUrls, ...newImageUrls];
  payload.imageUrls = finalImageUrls;

  const result = await Product.findOneAndUpdate({ _id: productId }, payload, {
    new: true,
  });

  return result;
};

export const ProductService = {
  getProductById,
  getAllProducts,
  createProduct,
  updateProduct,
};
