import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from '../auth/jwt/jwt-payload.interface';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { UpdateUserDto } from '../user/dto/updateUser.dto';
import { FileUploaderService } from '../uploads/upload.service';
import { GetAuthUser } from './decorators';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly fileUploadService: FileUploaderService,
  ) {}

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userService.getUserById(payload.id);
    if (!user) throw new Error(`User ${payload.email} not found`);

    return user;
  }

  async register(createUser: CreateUserDto): Promise<{ user: User }> {
    const existingUser = await this.userService.getUserByEmail(
      createUser.email,
    );
    if (existingUser) {
      throw new ForbiddenException('User already exists');
    }
    const user = this.UserRepository.create(createUser);
    const createdUser = await this.UserRepository.save(user);
    return { user: createdUser };
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await compare(password, hashedPassword);
  }

  async getUserByEmail(user): Promise<User> {
    return await this.userService.getUserById(user.email);
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.UserRepository.findOne({
      where: { email: email },
      select: ['id', 'email', 'username', 'password'],
    });

    if (!user) throw new NotFoundException('User not found');
    const isMatch = await this.comparePasswords(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Wrong password');

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      sub: user.id,
    };
    return await this.jwtService.signAsync(payload, { expiresIn: '1 day' });
  }

  async addPictureToUser(user: User, file: Express.Multer.File): Promise<void> {
    const uploadedFile = await this.fileUploadService.uploadFile(file);
    user.avatar = uploadedFile;
    await this.UserRepository.save(user);
  }

  // async uploadProfilePicture(
  //   @GetAuthUser() user: User,
  //   updateDto: UpdateUserDto,
  //   file: Express.Multer.File,
  // ) {
  //   const { about, firstName, lastName, username } = updateDto;
  //   const userToUpdate = await this.userService.getUserById(user.id);

  //   if (userToUpdate.id !== user.id) {
  //     throw new ForbiddenException('Unauthorized');
  //   }

  //   const uploadedAvatarUrl = await this.fileUploadService.uploadFile(file);

  //   userToUpdate.avatar = uploadedAvatarUrl;
  //   userToUpdate.about = about;
  //   userToUpdate.firstName = firstName;
  //   userToUpdate.lastName = lastName;
  //   userToUpdate.username = username;

  //   const updatedUser = await this.UserRepository.save(userToUpdate);

  //   return { user: updatedUser };
  // }
}
