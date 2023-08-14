import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { JwtGuard } from 'src/auth/guards';
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
  @UseInterceptors(ClassSerializerInterceptor)
  async profile(@Param('slug') slug: string): Promise<{ user: User }> {
    const user = await this.userService.getUserBySlug(slug);
    return { user };
  }
}
