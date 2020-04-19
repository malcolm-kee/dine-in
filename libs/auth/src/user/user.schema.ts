import * as mongoose from 'mongoose';
import { UserDocument } from './user.type';

export const UserSchema = new mongoose.Schema<UserDocument>({
  username: {
    type: String,
    unique: true,
  },
  password: String,
});
