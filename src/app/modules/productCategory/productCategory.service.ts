import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { productCategorySearchableFields } from "./productCategory.constant";
import { TProductCategory } from "./productCategory.interface";
import { ProductCategory } from "./productCategory.model";
import { getExistingProductCategoryById } from "./productCategory.utils";

const getAllProductCategories = async (query: Record<string, unknown>) => {
  const productCategoryQuery = new QueryBuilder(
    ProductCategory.find({ isActive: true }),
    query
  )
    .search(productCategorySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productCategoryQuery.modelQuery;
  const meta = await productCategoryQuery.countTotal();

  return {
    meta,
    result,
  };
};

const createProductCategory = async (payload: TProductCategory) => {
  const result = await ProductCategory.create(payload);

  return result;
};

const updateProductCategory = async (
  id: string,
  payload: Partial<TProductCategory>
) => {
  const existingProductCategory = await getExistingProductCategoryById(id);

  if (!existingProductCategory) {
    throw new AppError(httpStatus.NOT_FOUND, "Product Category not found");
  }

  const result = await ProductCategory.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const deleteProductCategory = async (id: string) => {
  const existingProductCategory = await getExistingProductCategoryById(id);

  if (!existingProductCategory) {
    throw new AppError(httpStatus.NOT_FOUND, "Product Category not found");
  }

  const result = await ProductCategory.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  return result;
};

export const ProductCategoryService = {
  getAllProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
};
