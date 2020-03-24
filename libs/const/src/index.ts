import type { Observable } from 'rxjs';

export const RESTAURANT_CONNECTION_NAME = 'restaurants';
export const RESTAURANT_DB_URL = 'RESTAURANT_DB_URL';
export const REDIS_URL = 'REDIS_URL';
export const JWT_SECRET = 'JWT_SECRET';

export type WithId<Type> = Type & {_id: string}

export const Events = {
  setup_changed: 'setup_changed',
  table_occupied: 'table_occupied',
  table_vacant: 'table_vacant',
  new_reservation: 'new_reservation',
  reservation_fulfilled: 'reservation_fulfilled',
} as const;

export type EventPayload = {
  setup_changed: {
    restaurant: string;
  };
  table_occupied: {
    restaurant: string;
    tableId: string;
  };
  table_vacant: {
    restaurant: string;
    tableId: string;
  };
  new_reservation: {
    restaurant: string;
    id: string;
    queueNum: number;
    pax: number;
  };
  reservation_fulfilled: {
    id: string;
    restaurant: string;
    queueNum: number;
    tableNames: string[];
  };
};

export interface CustomClientProxy {
  emit<Pattern extends keyof EventPayload>(
    pattern: Pattern,
    data: EventPayload[Pattern],
  ): Observable<unknown>;
}
