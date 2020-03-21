import * as mongoose from 'mongoose';
import { RestaurantDocument, RestaurantTableDocument } from './restaurant.type';

export const RestaurantTableSchema = new mongoose.Schema<
  RestaurantTableDocument
>(
  {
    label: String,
    numberOfSeat: Number,
    status: String,
  },
  {
    timestamps: true,
  },
);

export const RestaurantSchema = new mongoose.Schema<RestaurantDocument>(
  {
    name: String,
    slug: {
      type: String,
      unique: true,
    },
    tables: [RestaurantTableSchema],
  },
  { timestamps: true },
);
