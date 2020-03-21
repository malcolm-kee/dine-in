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

export type RestaurantDocument = Document &
  Omit<RestaurantData, 'tables'> & {
    tables: RestaurantTableDocument[];
  };

export const RESTAURANT_SCHEMA_NAME = 'Restaurant';

export type ReservationStatus = 'closed' | 'active';

export type Reservation = {
  status: ReservationStatus;
  /**
   * Queue number is for user to know how many people are in front them,
   * and it is duplicated as it will be refresh everyday.
   *
   */
  queueNum: number;
  pax: number;
};

export type ReservationDocument = Reservation & Document;

export const RESERVATION_SCHEMA_NAME = 'Reservation';
