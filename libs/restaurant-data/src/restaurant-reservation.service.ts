import { CustomClientProxy, Events } from '@app/const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EVENT_HUB,
  ReservationDocument,
  RESERVATION_SCHEMA_NAME,
} from './restaurant-data.type';

@Injectable()
export class RestaurantReservationService {
  constructor(
    @InjectModel(RESERVATION_SCHEMA_NAME)
    private readonly reservationModel: Model<ReservationDocument>,
    @Inject(EVENT_HUB) private readonly client: ClientProxy,
  ) {}

  private async getNextQueueNum(restaurant: string) {
    // TODO: potential race condition if multiple clients
    // don't bother about it for now as we have only one client
    const currentCount = await this.reservationModel.countDocuments({
      restaurant,
      createdAt: {
        $gte: getStartOfToday(),
      },
    });

    return currentCount + 1;
  }

  async create(restaurantSlug: string, pax: number) {
    const queueNum = await this.getNextQueueNum(restaurantSlug);

    const reservation = await this.reservationModel.create({
      status: 'active',
      queueNum,
      pax,
      restaurant: restaurantSlug,
    });

    (this.client as CustomClientProxy).emit(Events.new_reservation, {
      id: reservation._id,
      restaurant: restaurantSlug,
      queueNum,
      pax,
    });

    return reservation;
  }

  getNextActiveItem(restaurant: string) {
    return this.reservationModel
      .find({
        status: 'active',
        restaurant,
      })
      .sort({
        createdAt: 'asc',
      })
      .limit(1)
      .exec()
      .then(docs => docs && docs[0]);
  }

  closeReservation(id: string) {
    return this.reservationModel
      .findByIdAndUpdate(id, {
        status: 'closed',
      })
      .exec();
  }
}

const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
