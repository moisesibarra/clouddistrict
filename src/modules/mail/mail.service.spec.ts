import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}))

describe('MailService', () => {
  let service: MailService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'NODE_ENV') return 'development'
              return 'test-value'
            }),
          },
        },
      ],
    }).compile()

    service = module.get<MailService>(MailService)
    configService = module.get<ConfigService>(ConfigService)
  });

  it('should create transporter on module initialization', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'test-value',
      port: 'test-value',
      secure: false,
      auth: {
        user: 'test-value',
        pass: 'test-value',
      },
    })
  });

  it('should compile templates correctly', () => {
    const result = service['compileTemplate']('subscribe-email', {
      name: 'Test',
    })
    expect(result).toContain('Test')
  });
})
