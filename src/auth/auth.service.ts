import {
  All,
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
import { FileUploaderService } from '../uploads/upload.service';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly fileUploadService: FileUploaderService,
    private mailService: MailService,
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
    const jti = uuidv4();
    const user = this.UserRepository.create({ ...createUser, jti: jti });
    const createdUser = await this.UserRepository.save(user);
    await this.mailService.sendEmail(user);
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
      select: ['id', 'email', 'username', 'password', 'jti'],
    });

    if (!user) throw new NotFoundException('User not found');
    const isMatch = await this.comparePasswords(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Wrong password');

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      sub: user.id,
      jti: user.jti,
    };
    return await this.jwtService.signAsync(payload, { expiresIn: '1 day' });
  }

  async addPictureToUser(user: User, file: Express.Multer.File): Promise<void> {
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension))
      throw new BadRequestException(
        `Only images with ${allowedExtensions} allowed`,
      );
    const uploadedFile = await this.fileUploadService.uploadFile(file);
    user.avatar = uploadedFile;
    await this.UserRepository.save(user);
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.UserRepository.findOne({
      where: { id: id },
      select: ['id', 'username', 'email', 'jti'],
    });
    return user || null;
  }

  // async updateUser(user: User): Promise<{data: User}> {
  //   const userId = await this.userService.getUserById(user.id);
  //   if(!userId) throw new UnauthorizedException(
  // }
}
