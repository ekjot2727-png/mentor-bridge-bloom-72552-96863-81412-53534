import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DonationsService } from './donations.service';
import { StripeService } from './services/stripe.service';
import {
  CreateDonationDto,
  CreateSubscriptionDto,
  RefundDonationDto,
} from './dto/donation.dto';
import { DonationStatus } from './entities/donation.entity';
import { LoggerService } from '../../common/services/logger.service';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(
    private donationsService: DonationsService,
    private stripeService: StripeService,
    private logger: LoggerService,
  ) {}

  @Post('create-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent for donation' })
  async createPaymentIntent(@Req() req: any, @Body() dto: CreateDonationDto) {
    return this.donationsService.createPaymentIntent(
      req.user.id,
      req.user.email,
      dto,
    );
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a recurring donation subscription' })
  async createSubscription(@Req() req: any, @Body() dto: CreateSubscriptionDto) {
    return this.donationsService.createSubscription(
      req.user.id,
      req.user.email,
      dto,
    );
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a recurring donation' })
  async cancelSubscription(@Param('id') id: string, @Req() req: any) {
    return this.donationsService.cancelSubscription(id, req.user.id);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a donation (admin only)' })
  async refundDonation(
    @Param('id') id: string,
    @Body() dto: RefundDonationDto,
    @Req() req: any,
  ) {
    // TODO: Add admin role check
    return this.donationsService.refundDonation(id, dto, req.user.id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my donations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyDonations(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.donationsService.getUserDonations(
      req.user.id,
      page || 1,
      limit || 10,
    );
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donation statistics' })
  async getStatistics() {
    return this.donationsService.getStatistics();
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all donations (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: DonationStatus })
  async getAllDonations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: DonationStatus,
  ) {
    // TODO: Add admin role check
    return this.donationsService.getAllDonations(page || 1, limit || 20, status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donation by ID' })
  async getDonation(@Param('id') id: string, @Req() req: any) {
    return this.donationsService.getDonation(id, req.user.id);
  }

  @Post('webhook')
  @SkipThrottle()
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.error('No raw body found in webhook request');
      return { received: false };
    }

    try {
      const event = this.stripeService.constructWebhookEvent(rawBody, signature);

      this.logger.log(`Received Stripe webhook: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as any;
          await this.donationsService.handlePaymentSuccess(paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as any;
          await this.donationsService.handlePaymentFailure(failedPayment.id);
          break;

        case 'invoice.payment_succeeded':
          // Handle recurring donation payment
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            this.logger.log(`Subscription payment succeeded: ${invoice.subscription}`);
          }
          break;

        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          const subscription = event.data.object as any;
          this.logger.log(`Subscription cancelled: ${subscription.id}`);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
      return { received: false, error: error.message };
    }
  }
}
