import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MailerTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async jwtMailer(data) {
    const token = this.jwtService.sign(data, {
      secret: process.env.JWT_VERIFICATION_TOKEN,
      expiresIn: 36000,
    });

    return token;
  }
}
