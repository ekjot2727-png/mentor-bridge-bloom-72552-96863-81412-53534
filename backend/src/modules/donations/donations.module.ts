import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from './entities/donation.entity';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { StripeService } from './services/stripe.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donation])],
  controllers: [DonationsController],
  providers: [DonationsService, StripeService],
  exports: [DonationsService, StripeService],
})
export class DonationsModule {}
