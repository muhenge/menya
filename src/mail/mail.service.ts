import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../user/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome',
      template: './confirmation',
      context: {
        name: user.firstName,
      },
    });
  }
}
