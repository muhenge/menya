import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { JwtGuard } from 'src/auth/guards';
import { Request } from 'express';

@Controller('users/')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getUsers(): Promise<{ data: number; users: UserDto[] }> {
    const users = await this.userService.getUsers();
    const userDtos = users.map(
      ({
        id,
        username,
        email,
        firstName,
        lastName,
        slug,
        avatar,
        created_at,
        updated_at,
      }) => ({
        id,
        username,
        email,
        firstName,
        lastName,
        slug,
        avatar,
        created_at,
        updated_at,
      }),
    );
    return { data: userDtos.length, users: userDtos };
  }

  @Get('profile/:slug')
  @UseGuards(JwtGuard)
  async profile(
    @Param('slug') slug: string,
    @Req() req: Request,
  ): Promise<{ user: User }> {
    console.log(req.headers.authorization);
    const user = await this.userService.getUserBySlug(slug);
    return { user };
  }
}
