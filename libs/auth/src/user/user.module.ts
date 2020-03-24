import { RESTAURANT_CONNECTION_NAME } from '@app/const';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';
import { USER_SCHEMA_NAME } from './user.type';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: USER_SCHEMA_NAME,
          schema: UserSchema,
        },
      ],
      RESTAURANT_CONNECTION_NAME,
    ),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
