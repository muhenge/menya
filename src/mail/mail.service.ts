import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtMailerService: JwtService,
  ) {}

  async sendEmail(user: User) {
    const token = Math.random().toString(36).substring(7);
    const url = `http://localhost:3333/api/auth/confirm?token=${token}`;
    await this.mailerService.sendMail({
      from: ``, // sender address
      to: `${user.email}`,
      subject: 'Welcome ',
      text: `
        Hello ${user.username},
        Thank you for registering with us. Please confirm your account by clicking the link below
        ${url}
      `,
      html: `
      <p>Hello, ${user.firstName}</p><br>
      <p>Thank you for registering with us. Please confirm your account by clicking the link below.</p>
      <a href="${url}">Click here to confirm your account</a>
      `,
    });
  }
}
