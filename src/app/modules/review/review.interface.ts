import { Types } from "mongoose";

export type TReview = {
  user: Types.ObjectId;
  product: Types.ObjectId;
  order: Types.ObjectId;
  rating: number;
  comment?: string;
  isActive: boolean;
};
