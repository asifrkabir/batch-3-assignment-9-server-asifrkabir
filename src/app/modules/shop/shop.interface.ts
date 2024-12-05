import { Types } from "mongoose";

export type TShop = {
  name: string;
  logoUrl?: string;
  description: string;
  owner: Types.ObjectId;
  isBlacklisted: boolean;
  isActive: boolean;
};
