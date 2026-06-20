import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { VerifySessionDto } from './dto/verify-session.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guards';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Crée une session Stripe Checkout',
    description:
      'Pour un plan gratuit, active directement. Pour un plan payant, retourne l\'URL Stripe Checkout.',
  })
  createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    return this.paymentService.createCheckoutSession(dto);
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Vérifie le paiement et active l\'abonnement',
    description:
      'Appelé depuis la page success après redirection Stripe. Vérifie le statut auprès de l\'API Stripe et active l\'abonnement si payment_status === paid.',
  })
  verifyAndActivate(@Body() dto: VerifySessionDto) {
    return this.paymentService.verifyAndActivate(dto.sessionId);
  }
}
