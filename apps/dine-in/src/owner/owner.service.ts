import { AuthService, User } from '@app/auth';
import {
  RestaurantData,
  RestaurantDataService,
  RestaurantTable,
  RestaurantTableStatus,
} from '@app/restaurant-data';
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { slugify } from '../lib/slugify';
import { isEqualId } from '../lib/equal-id';

@Injectable()
export class OwnerService {
  constructor(
    private readonly restaurantService: RestaurantDataService,
    private readonly authService: AuthService,
  ) {}

  async register(
    data: Omit<RestaurantDataWithoutTableStatusAndOwnerId, 'slug'> &
      Omit<User, 'userId'>,
  ) {
    const { username, password, ...restaurantData } = data;
    const user = await this.authService.createUser(username, password);

    const restaurant = await this.restaurantService.create({
      ...restaurantData,
      ownerId: user._id,
      slug: slugify(restaurantData.name),
      tables: restaurantData.tables.map(resetTableStatus),
    });

    return restaurant;
  }

  async updateSetting(data: RestaurantDataWithoutTableStatus) {
    const restaurant = await this.restaurantService.getBySlug(data.slug);

    if (!restaurant) {
      throw new NotFoundException();
    }

    if (!isEqualId(restaurant.ownerId, data.ownerId)) {
      throw new UnauthorizedException();
    }

    return this.restaurantService.update({
      ...data,
      tables: data.tables.map(resetTableStatus),
    });
  }

  getDetails(restaurantSlug: string) {
    return this.restaurantService.getBySlug(restaurantSlug);
  }

  async updateTableStatus(data: UpdateTableData) {
    const restaurant = await this.restaurantService.getBySlug(
      data.restaurantSlug,
    );
    if (!restaurant) {
      throw new NotFoundException();
    }
    if (!isEqualId(restaurant.ownerId, data.ownerId)) {
      throw new UnauthorizedException();
    }

    if (data.status === 'vacant') {
      return this.restaurantService.releaseTable(
        data.restaurantSlug,
        data.tableId,
      );
    } else {
      return this.restaurantService.occupyTable(
        data.restaurantSlug,
        data.tableId,
      );
    }
  }
}

type TableWithoutStatus = Omit<RestaurantTable, 'status'>;

type RestaurantDataWithoutTableStatus = Omit<RestaurantData, 'tables'> & {
  tables: Array<TableWithoutStatus>;
};

type RestaurantDataWithoutTableStatusAndOwnerId = Omit<
  RestaurantDataWithoutTableStatus,
  'ownerId'
>;

const resetTableStatus = (table: TableWithoutStatus): RestaurantTable => ({
  ...table,
  status: 'vacant',
});

type UpdateTableData = {
  restaurantSlug: string;
  tableId: string;
  status: RestaurantTableStatus;
  ownerId: string;
};
