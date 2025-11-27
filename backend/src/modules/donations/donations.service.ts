import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation, DonationStatus, DonationType } from './entities/donation.entity';
import { CreateDonationDto, RefundDonationDto, CreateSubscriptionDto } from './dto/donation.dto';
import { StripeService } from './services/stripe.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditCategory } from '../audit/entities/audit-log.entity';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    private stripeService: StripeService,
    private auditService: AuditService,
    private logger: LoggerService,
  ) {}

  /**
   * Create a payment intent for a donation
   */
  async createPaymentIntent(userId: string, userEmail: string, dto: CreateDonationDto) {
    // Get or create Stripe customer
    const customer = await this.stripeService.getOrCreateCustomer(userId, userEmail);

    // Create payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent(
      dto.amount,
      dto.currency || 'USD',
      customer.id,
      {
        userId,
        donationType: dto.type || DonationType.ONE_TIME,
        campaignId: dto.campaignId || '',
      },
    );

    // Create donation record
    const donation = this.donationRepository.create({
      userId,
      amount: dto.amount,
      currency: dto.currency || 'USD',
      type: dto.type || DonationType.ONE_TIME,
      status: DonationStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customer.id,
      message: dto.message,
      isAnonymous: dto.isAnonymous || false,
      campaignId: dto.campaignId,
      metadata: dto.metadata,
    });

    await this.donationRepository.save(donation);

    this.logger.log(`Created donation: ${donation.id} with payment intent: ${paymentIntent.id}`);

    return {
      donationId: donation.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Create a recurring donation subscription
   */
  async createSubscription(userId: string, userEmail: string, dto: CreateSubscriptionDto) {
    // Get or create Stripe customer
    const customer = await this.stripeService.getOrCreateCustomer(userId, userEmail);

    // Get or create price for the recurring amount
    const price = await this.stripeService.getOrCreatePrice(
      dto.amount,
      dto.currency || 'USD',
      dto.interval || 'month',
    );

    // Create subscription
    const subscription = await this.stripeService.createSubscription(
      customer.id,
      price.id,
      { userId },
    );

    // Create donation record
    const donation = this.donationRepository.create({
      userId,
      amount: dto.amount,
      currency: dto.currency || 'USD',
      type: DonationType.RECURRING,
      status: DonationStatus.PENDING,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      isAnonymous: dto.isAnonymous || false,
    });

    await this.donationRepository.save(donation);

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent as any;

    return {
      donationId: donation.id,
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
    };
  }

  /**
   * Handle successful payment (called by webhook)
   */
  async handlePaymentSuccess(paymentIntentId: string) {
    const donation = await this.donationRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!donation) {
      this.logger.warn(`Donation not found for payment intent: ${paymentIntentId}`);
      return;
    }

    donation.status = DonationStatus.COMPLETED;
    donation.completedAt = new Date();
    await this.donationRepository.save(donation);

    // Log audit event
    await this.auditService.logPayment(
      donation.userId,
      Number(donation.amount),
      donation.currency,
      paymentIntentId,
      { donationId: donation.id, type: donation.type },
    );

    this.logger.log(`Donation completed: ${donation.id}`);
    return donation;
  }

  /**
   * Handle failed payment (called by webhook)
   */
  async handlePaymentFailure(paymentIntentId: string) {
    const donation = await this.donationRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!donation) {
      this.logger.warn(`Donation not found for payment intent: ${paymentIntentId}`);
      return;
    }

    donation.status = DonationStatus.FAILED;
    await this.donationRepository.save(donation);

    this.logger.log(`Donation failed: ${donation.id}`);
    return donation;
  }

  /**
   * Refund a donation
   */
  async refundDonation(donationId: string, dto: RefundDonationDto, adminUserId: string) {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    if (donation.status !== DonationStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed donations');
    }

    if (!donation.stripePaymentIntentId) {
      throw new BadRequestException('No payment to refund');
    }

    // Process refund through Stripe
    await this.stripeService.createRefund(
      donation.stripePaymentIntentId,
      dto.amount,
      dto.reason,
    );

    // Update donation status
    donation.status = DonationStatus.REFUNDED;
    donation.refundedAt = new Date();
    donation.metadata = {
      ...donation.metadata,
      refundReason: dto.reason,
      refundedBy: adminUserId,
    };
    await this.donationRepository.save(donation);

    // Log audit event
    await this.auditService.log({
      userId: adminUserId,
      action: AuditAction.REFUND,
      category: AuditCategory.PAYMENT,
      resource: 'Donation',
      resourceId: donationId,
      description: `Refund processed for donation ${donationId}`,
      metadata: { originalAmount: donation.amount, refundAmount: dto.amount || donation.amount },
    });

    this.logger.log(`Donation refunded: ${donationId}`);
    return donation;
  }

  /**
   * Cancel a recurring donation
   */
  async cancelSubscription(donationId: string, userId: string) {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId, userId },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    if (!donation.stripeSubscriptionId) {
      throw new BadRequestException('Not a recurring donation');
    }

    await this.stripeService.cancelSubscription(donation.stripeSubscriptionId);

    donation.status = DonationStatus.CANCELLED;
    await this.donationRepository.save(donation);

    this.logger.log(`Subscription cancelled: ${donationId}`);
    return donation;
  }

  /**
   * Get user's donations
   */
  async getUserDonations(userId: string, page = 1, limit = 10) {
    const [donations, total] = await this.donationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: donations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get donation by ID
   */
  async getDonation(donationId: string, userId?: string) {
    const where: any = { id: donationId };
    if (userId) {
      where.userId = userId;
    }

    const donation = await this.donationRepository.findOne({ where });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return donation;
  }

  /**
   * Get donation statistics
   */
  async getStatistics() {
    const stats = await this.donationRepository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'totalAmount')
      .addSelect('COUNT(donation.id)', 'totalCount')
      .addSelect('AVG(donation.amount)', 'averageAmount')
      .where('donation.status = :status', { status: DonationStatus.COMPLETED })
      .getRawOne();

    const monthlyStats = await this.donationRepository
      .createQueryBuilder('donation')
      .select("DATE_TRUNC('month', donation.createdAt)", 'month')
      .addSelect('SUM(donation.amount)', 'amount')
      .addSelect('COUNT(donation.id)', 'count')
      .where('donation.status = :status', { status: DonationStatus.COMPLETED })
      .andWhere('donation.createdAt > :date', {
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      })
      .groupBy("DATE_TRUNC('month', donation.createdAt)")
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalAmount: Number(stats.totalAmount) || 0,
      totalCount: Number(stats.totalCount) || 0,
      averageAmount: Number(stats.averageAmount) || 0,
      monthlyStats,
    };
  }

  /**
   * Get all donations (admin)
   */
  async getAllDonations(page = 1, limit = 20, status?: DonationStatus) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [donations, total] = await this.donationRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: donations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
