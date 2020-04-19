import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { User } from './user/user.type';
import { WithId } from '@app/const';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async createUser(username: string, password: string) {
    const currentUser = await this.userService.findOne(username);
    if (currentUser) {
      throw new ConflictException({
        message: ['Username already taken.'],
      });
    }

    return this.userService.create({
      username,
      password,
    });
  }

  async validateUser(userName: string, password: string) {
    const user = await this.userService.findOne(userName);

    if (user && user.password === password) {
      const { password, ...result } = user.toObject();
      return result;
    }

    return null;
  }

  async login(user: WithId<User>) {
    const payload = {
      username: user.username,
      sub: user._id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
