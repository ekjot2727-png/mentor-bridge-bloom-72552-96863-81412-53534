import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { LoggerService } from '../../../common/services/logger.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('Stripe secret key not configured');
    }
    
    this.stripe = new Stripe(secretKey || '', {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<Stripe.Customer> {
    try {
      // Search for existing customer
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: { userId },
      });

      this.logger.log(`Created Stripe customer: ${customer.id} for user: ${userId}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create/get Stripe customer: ${error.message}`);
      throw new BadRequestException('Failed to process customer');
    }
  }

  /**
   * Create a payment intent for one-time donation
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata: {
          ...metadata,
          type: 'donation',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Created payment intent: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`);
      throw new BadRequestException('Failed to create payment');
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${error.message}`);
      throw new NotFoundException('Payment not found');
    }
  }

  /**
   * Create a subscription for recurring donations
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          ...metadata,
          type: 'recurring_donation',
        },
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log(`Created subscription: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw new BadRequestException('Failed to create subscription');
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      this.logger.log(`Cancelled subscription: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string,
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: (reason as Stripe.RefundCreateParams.Reason) || 'requested_by_customer',
      });

      this.logger.log(`Created refund: ${refund.id} for payment: ${paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`);
      throw new BadRequestException('Failed to process refund');
    }
  }

  /**
   * Create or get a price for recurring donations
   */
  async getOrCreatePrice(
    amount: number,
    currency: string,
    interval: 'month' | 'year',
  ): Promise<Stripe.Price> {
    try {
      const productName = `Recurring Donation - ${amount} ${currency.toUpperCase()}/${interval}`;
      
      // Search for existing price
      const existingPrices = await this.stripe.prices.list({
        lookup_keys: [`donation_${amount}_${currency}_${interval}`],
        limit: 1,
      });

      if (existingPrices.data.length > 0) {
        return existingPrices.data[0];
      }

      // Create product first
      const product = await this.stripe.products.create({
        name: productName,
        metadata: { type: 'donation' },
      });

      // Create price
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        recurring: { interval },
        lookup_key: `donation_${amount}_${currency}_${interval}`,
      });

      return price;
    } catch (error) {
      this.logger.error(`Failed to create price: ${error.message}`);
      throw new BadRequestException('Failed to setup recurring donation');
    }
  }

  /**
   * Verify webhook signature
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Get Stripe instance for advanced operations
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}
