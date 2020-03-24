import { Document } from 'mongoose';

export const USER_SCHEMA_NAME = 'User';

export type User = {
  username: string;
  password: string;
};

export type UserDocument = User & Document;
