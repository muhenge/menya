import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDto } from '../user/dto/user.dto';
import { signinDto } from 'src/user/dto/signIn-user.dto';
import { JwtGuard } from './guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetAuthUser } from './decorators';
import { User } from 'src/user/entities/user.entity';
import { UpdateUserDto } from '../user/dto/updateUser.dto';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  async signup(
    @Body() createUser: CreateUserDto,
  ): Promise<{ message: string; user: UserDto }> {
    try {
      const { user } = await this.authService.register(createUser);
      const {
        id,
        username,
        email,
        firstName,
        lastName,
        jti,
        created_at,
        updated_at,
      } = user;
      const userDto = {
        id,
        username,
        email,
        firstName,
        lastName,
        jti,
        created_at,
        updated_at,
      };
      return {
        message:
          'Account created! Please check your email inbox for an activation link. Click on it to verify your email.',
        user: userDto,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('confirm')
  async getVerified(@Query('token') token: string) {
    return await this.authService.getVerifiedEmail(token);
  }

  @Post('login')
  async signin(
    @Body() credentials: signinDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{
    message: string;
    data: object;
    accessToken: { token: string };
  }> {
    try {
      const token = await this.authService.login(
        credentials.email,
        credentials.password,
      );

      const user = await this.userService.getUserByEmail(credentials.email);
      if (!token) throw new Error('Invalid credentials ');
      response.cookie('token', token, { httpOnly: true });
      return {
        message: 'Sign in successfully',
        accessToken: {
          token,
        },
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
  @Put('upload')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUserWithAvatar(
    @UploadedFile() file: Express.Multer.File,
    @GetAuthUser() user: User,
  ) {
    const response = await this.authService.addPictureToUser(user, file);

    return { response };
  }

  @Put('update')
  @UseGuards(JwtGuard)
  async update(
    @GetAuthUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.authService.updateUser(user.id, updateUserDto);
  }

  @Put('forget')
  @UseGuards(JwtGuard)
  async forgetPassword(
    @GetAuthUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.authService.forgotPassword(user);
  }
}
