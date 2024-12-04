import { model, Schema } from "mongoose";
import { TShop } from "./shop.interface";

const shopSchema = new Schema<TShop>(
  {
    name: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shop = model<TShop>("Shop", shopSchema);
