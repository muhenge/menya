import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDto } from '../user/dto/user.dto';
import { UseGuards } from '@nestjs/common';
import { signinDto } from 'src/user/dto/signIn-user.dto';
import { UserService } from '../user/user.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseGuards()
  async signup(@Body() createUser: CreateUserDto): Promise<{ user: UserDto }> {
    try {
      const { user } = await this.authService.register(createUser);
      const {
        id,
        username,
        email,
        firstName,
        lastName,
        created_at,
        updated_at,
      } = user;
      const userDto = {
        id,
        username,
        email,
        firstName,
        lastName,
        created_at,
        updated_at,
      };
      return { user: userDto };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Post('login')
  async signin(
    @Body() credentials: signinDto,
  ): Promise<{ message: string; user: signinDto; token: string }> {
    try {
      const token = await this.authService.login(
        credentials.email,
        credentials.password,
      );

      if (!token) throw new Error('Invalid credentials ');
      return {
        message: 'Sign in successfully',
        user: credentials,
        token: token,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
