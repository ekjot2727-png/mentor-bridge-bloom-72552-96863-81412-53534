import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { LoggerService } from '../../common/services/logger.service';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean = false;

  // Email templates
  private templates: Record<string, string> = {
    welcome: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to AlNet!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello {{name}},</h2>
          <p>Thank you for joining AlNet - the premier alumni networking platform.</p>
          <p>Your account has been successfully created. You can now:</p>
          <ul>
            <li>Connect with fellow alumni</li>
            <li>Explore job opportunities</li>
            <li>Attend exclusive events</li>
            <li>Get AI-powered career advice</li>
          </ul>
          <a href="{{loginUrl}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Get Started</a>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© {{year}} AlNet. All rights reserved.</p>
        </div>
      </div>
    `,
    
    connectionRequest: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Connection Request</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Hi {{recipientName}},</p>
          <p><strong>{{senderName}}</strong> wants to connect with you on AlNet.</p>
          {{#if senderTitle}}
          <p style="color: #666;">{{senderTitle}} at {{senderCompany}}</p>
          {{/if}}
          <a href="{{actionUrl}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Request</a>
        </div>
      </div>
    `,
    
    newMessage: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Message</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Hi {{recipientName}},</p>
          <p>You have a new message from <strong>{{senderName}}</strong>:</p>
          <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="margin: 0; color: #333;">{{messagePreview}}</p>
          </div>
          <a href="{{actionUrl}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reply</a>
        </div>
      </div>
    `,
    
    donationThankYou: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Dear {{name}},</h2>
          <p>Thank you for your generous donation of <strong>{{amount}} {{currency}}</strong> to AlNet.</p>
          <p>Your contribution helps us:</p>
          <ul>
            <li>Support student scholarships</li>
            <li>Fund networking events</li>
            <li>Improve our platform</li>
          </ul>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Donation Receipt</h3>
            <p><strong>Amount:</strong> {{amount}} {{currency}}</p>
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Transaction ID:</strong> {{transactionId}}</p>
          </div>
          <p style="color: #666; font-size: 14px;">This email serves as your donation receipt for tax purposes.</p>
        </div>
      </div>
    `,
    
    eventReminder: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Event Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Hi {{name}},</p>
          <p>This is a reminder that you're registered for:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333;">{{eventTitle}}</h2>
            <p><strong>📅 Date:</strong> {{eventDate}}</p>
            <p><strong>⏰ Time:</strong> {{eventTime}}</p>
            <p><strong>📍 Location:</strong> {{eventLocation}}</p>
          </div>
          <a href="{{eventUrl}}" style="display: inline-block; background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Event Details</a>
        </div>
      </div>
    `,
    
    passwordReset: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Hi {{name}},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="{{resetUrl}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px;">This link will expire in {{expiresIn}}.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    if (!host || !user || !pass) {
      this.logger.warn('Email service not configured. Email sending disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: port || 587,
      secure: port === 465,
      auth: { user, pass },
    });

    this.isConfigured = true;
    this.logger.log('Email service initialized');
  }

  /**
   * Send an email using a template
   */
  async send(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.warn(`Email not sent (service not configured): ${options.subject}`);
      return false;
    }

    try {
      const template = this.templates[options.template];
      if (!template) {
        throw new Error(`Email template '${options.template}' not found`);
      }

      const compiledTemplate = Handlebars.compile(template);
      const html = compiledTemplate({
        ...options.context,
        year: new Date().getFullYear(),
      });

      const from = this.configService.get<string>('MAIL_FROM', 'noreply@alnet.com');
      const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

      await this.transporter.sendMail({
        from,
        to: recipients,
        subject: options.subject,
        html,
        attachments: options.attachments,
      });

      this.logger.log(`Email sent: ${options.subject} to ${recipients}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcome(to: string, name: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    return this.send({
      to,
      subject: 'Welcome to AlNet!',
      template: 'welcome',
      context: { name, loginUrl: `${frontendUrl}/login` },
    });
  }

  /**
   * Send connection request email
   */
  async sendConnectionRequest(
    to: string,
    recipientName: string,
    senderName: string,
    senderTitle?: string,
    senderCompany?: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    return this.send({
      to,
      subject: `${senderName} wants to connect with you`,
      template: 'connectionRequest',
      context: {
        recipientName,
        senderName,
        senderTitle,
        senderCompany,
        actionUrl: `${frontendUrl}/connections/pending`,
      },
    });
  }

  /**
   * Send new message notification
   */
  async sendNewMessageNotification(
    to: string,
    recipientName: string,
    senderName: string,
    messagePreview: string,
    conversationId: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    return this.send({
      to,
      subject: `New message from ${senderName}`,
      template: 'newMessage',
      context: {
        recipientName,
        senderName,
        messagePreview: messagePreview.substring(0, 200) + (messagePreview.length > 200 ? '...' : ''),
        actionUrl: `${frontendUrl}/messages/${conversationId}`,
      },
    });
  }

  /**
   * Send donation thank you email
   */
  async sendDonationThankYou(
    to: string,
    name: string,
    amount: number,
    currency: string,
    transactionId: string,
  ): Promise<boolean> {
    return this.send({
      to,
      subject: 'Thank you for your donation to AlNet!',
      template: 'donationThankYou',
      context: {
        name,
        amount: amount.toFixed(2),
        currency: currency.toUpperCase(),
        date: new Date().toLocaleDateString(),
        transactionId,
      },
    });
  }

  /**
   * Send event reminder email
   */
  async sendEventReminder(
    to: string,
    name: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventLocation: string,
    eventId: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    return this.send({
      to,
      subject: `Reminder: ${eventTitle}`,
      template: 'eventReminder',
      context: {
        name,
        eventTitle,
        eventDate,
        eventTime,
        eventLocation,
        eventUrl: `${frontendUrl}/events/${eventId}`,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: string, name: string, resetToken: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    return this.send({
      to,
      subject: 'Reset your AlNet password',
      template: 'passwordReset',
      context: {
        name,
        resetUrl: `${frontendUrl}/reset-password?token=${resetToken}`,
        expiresIn: '1 hour',
      },
    });
  }

  /**
   * Verify email configuration
   */
  async verify(): Promise<boolean> {
    if (!this.isConfigured) return false;
    
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
