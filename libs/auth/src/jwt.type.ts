import { Request } from 'express';

export type JwtPayload = {
  userId: string;
  username: string;
};

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
};
