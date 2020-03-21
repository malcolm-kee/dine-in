import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Model } from 'mongoose';
import {
  ReservationDocument,
  RESERVATION_SCHEMA_NAME,
  EVENT_HUB,
} from './restaurant.type';
import { Events } from 'src/app.type';

@Injectable()
export class RestaurantReservationService {
  constructor(
    @InjectModel(RESERVATION_SCHEMA_NAME)
    private readonly reservationModel: Model<ReservationDocument>,
    @Inject(EVENT_HUB) private readonly client: ClientProxy,
  ) {}

  private async getNextQueueNum() {
    // TODO: potential race condition if multiple clients
    // don't bother about it for now as we have only one client
    const currentCount = await this.reservationModel.count({
      createdAt: {
        $gte: getStartOfToday(),
      },
    });

    return currentCount + 1;
  }

  async create(pax: number) {
    const queueNum = await this.getNextQueueNum();

    const reservation = await this.reservationModel.create({
      status: 'active',
      queueNum,
      pax,
    });

    this.client.emit(Events.new_reservation, {
      id: reservation._id,
      queueNum,
      pax,
    });

    return reservation;
  }

  getNextActiveItem() {
    return this.reservationModel
      .find({
        status: 'active',
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
