import { Document } from 'mongoose';

export type RestaurantTableStatus = 'occupied' | 'vacant';

export type RestaurantTable = {
  label: string;
  numberOfSeat: number;
  status: RestaurantTableStatus;
};

export type RestaurantTableDocument = RestaurantTable & Document;

export type RestaurantData = {
  name: string;
  slug: string;
  tables: Array<RestaurantTable>;
};

export type RestaurantDocument = RestaurantData & Document;

export const RESTAURANT_SCHEMA_NAME = 'Restaurant';
