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
    const payload = {
      user: user.email,
      username: user.username,
    };
    const jwtSignOptions = {
      secret: process.env.JWT_TOKEN,
      expiresIn: '1 day',
    };
    const token = this.jwtMailerService.sign(payload, jwtSignOptions);
    const url = `http://localhost:3333/api/auth/confirm?token=${token}`;
    await this.mailerService.sendMail({
      from: `No reply`,
      to: `${user.email}`,
      subject: 'Confirm you email',
      template: 'confirmation',
      context: {
        url,
        username: payload.username,
      },
    });
  }
  async sendForgotPasswordConfirmation(user: User): Promise<void> {
    const payload = {
      user: user.email,
    };
    const jwtSignOptions = {
      secret: process.env.JWT_TOKEN_SECRET_FOR_FORGOT_PASSWORD,
      expiresIn: '1 day',
    };
    const token = this.jwtMailerService.sign(payload, jwtSignOptions);
    const url = `http://localhost:3333/api/auth/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      from: `No reply`,
      to: `${user.email}`,
      subject: 'Update Password',
      text: `
      Hello ${user.username},
      Please update your password by clicking the link below ${url}
      `,
      html: `
      <p>Hello, ${user.firstName}</p><br>
      <p>Please update your password by clicking the link below</p><br>
      <center><a href="${url}" target="_blank">Click here to confirm your account</a></center>
      `,
    });
  }
}
