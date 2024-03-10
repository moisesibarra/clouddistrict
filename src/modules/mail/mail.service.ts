import { CONFIG_VALUES } from '@/common/constants';
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer'
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  private transporter

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure:
        this.configService.get<string>('NODE_ENV') ===
        CONFIG_VALUES.PRODUCTION_STRING,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    })
  }

  private compileTemplate(templateName: string, context: any): string {
    const filePath = join(__dirname, 'templates', `${templateName}.hbs`)
    const templateSource = readFileSync(filePath, 'utf8')
    const template = handlebars.compile(templateSource)
    return template(context)
  }

  async sendMail(
    to: string,
    subject: string,
    templateName: string,
    context: any,
  ) {
    const html = this.compileTemplate(templateName, context)
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject,
      html,
    }

    return this.transporter.sendMail(mailOptions)
  }
}
