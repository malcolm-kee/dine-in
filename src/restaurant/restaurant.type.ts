import { Document } from 'mongoose';

export type RestaurantTable = {
  label: string;
  numberOfSeat: number;
};

export type RestaurantTableDocument = RestaurantTable & Document;

export type RestaurantData = {
  name: string;
  tables: Array<RestaurantTable>;
};

export type RestaurantDocument = RestaurantData & Document;

export const RESTAURANT_SCHEMA_NAME = 'Restaurant';
