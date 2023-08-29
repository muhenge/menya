import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
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
import { UpdateUserDto } from 'src/user/dto/updateUser.dto';
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
    if (!user) throw new NotFoundException(`User ${payload.email} not found`);
    return user;
  }

  async register(createUser: CreateUserDto): Promise<{ user: User }> {
    const existingUser = await this.userService.getUserByEmail(
      createUser.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    if (
      (createUser.email === '' && createUser.password === '',
      createUser.username === '')
    )
      throw new UnprocessableEntityException(
        'Email, Password and Username are required',
      );
    const jti = uuidv4();
    const user = this.UserRepository.create({ ...createUser, jti: jti });
    await this.mailService.sendEmail(user);
    const createdUser = await this.UserRepository.save(user);
    return { user: createdUser };
  }

  async getVerifiedEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.user) {
        const user = await this.userService.getUserByEmail(decoded.user.email);
        if (user) {
          user.isConfirmed = true;
          await this.UserRepository.save(user);
          return 'Account verified successfully!';
        }
      }
    } catch (error) {
      if (error.message.includes('Expired')) {
        throw new UnauthorizedException('Token has expired');
      }
      return 'Error: ' + error.message;
    }
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
      select: [
        'id',
        'email',
        'username',
        'password',
        'jti',
        'slug',
        'isConfirmed',
      ],
    });

    if (user.isConfirmed === false)
      throw new UnauthorizedException(
        'Please confirm your account, visit your email and click to confirm your account',
      );

    if (!user) throw new BadRequestException('Email not found');
    const isMatch = await this.comparePasswords(password, user.password);
    if (!isMatch) throw new BadRequestException('Wrong password');
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      slug: user.slug,
      sub: user.id,
      jti: user.jti,
    };

    return await this.jwtService.signAsync(payload, { expiresIn: '1 day' });
  }

  async addPictureToUser(user: User, file: Express.Multer.File) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension))
      throw new BadRequestException(
        `Only images with ${allowedExtensions} allowed`,
      );
    const uploadedFile = await this.fileUploadService.uploadFile(file);
    user.avatar = uploadedFile;
    await this.UserRepository.save(user);
    return { avatar: uploadedFile };
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.UserRepository.findOne({
      where: { id: id },
      select: ['id', 'username', 'email', 'jti'],
    });
    return user || null;
  }
  async updateUser(
    user_id: string,
    updateUser: UpdateUserDto,
  ): Promise<{ user: User }> {
    const found = await this.userService.getUserById(user_id);
    Object.assign(found, updateUser);
    const saved = await this.UserRepository.save(found);
    return { user: saved };
  }

  async forgotPassword(user: User) {
    const found = await this.userService.getUserByEmail(user.email);
    console.log(found.email);
    if (!found) throw new NotFoundException('Email not found');
    await this.mailService.sendForgotPasswordConfirmation(found);
  }
}
