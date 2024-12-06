import { Types } from "mongoose";

export type TPayment = {
  user: Types.ObjectId;
  order: Types.ObjectId;
  amount: number;
  status: "successful" | "failed";
};