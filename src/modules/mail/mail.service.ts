import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirm(email: string, token: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to our platform!',
      template: './signup',
      context: {
        verify: `http://localhost:3000/auth/confirm/${token}`,
      },
    });
  }
}
