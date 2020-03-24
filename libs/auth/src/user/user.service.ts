import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, USER_SCHEMA_NAME } from './user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(USER_SCHEMA_NAME)
    private readonly userModel: Model<UserDocument>,
  ) {}

  create(userData: User) {
    const user = new this.userModel(userData);
    return user.save();
  }

  findOne(username: string) {
    return this.userModel
      .findOne({
        username,
      })
      .exec();
  }
}
