export const RESTAURANT_CONNECTION_NAME = 'restaurants';
export const RESTAURANT_DB_URL = 'RESTAURANT_DB_URL';
export const REDIS_URL = 'REDIS_URL';

export const Events = {
  setup_changed: 'setup_changed',
  table_occupied: 'table_occupied',
  table_vacant: 'table_vacant',
  new_reservation: 'new_reservation',
  reservation_fulfilled: 'reservation_fulfilled',
} as const;
