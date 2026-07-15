import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import {
  LocalAuthGuard,
  JwtAuthGuard,
} from './guards/auth.guards';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser, Roles } from './decorators/auth.decorators';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../modules/users/entities/userRole.enum';
import type { FastifyReply, FastifyRequest } from 'fastify';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ─── Email / Password ────────────────────────────────────────────────────────
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() reply: FastifyReply) {
    const user = await this.authService.register(dto);

    if (!user) {
      throw new BadRequestException('Erreur création utilisateur');
    }

    const token = this.authService.generateJwt(user);

    return reply
      .setCookie('access_token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      .send({ success: true });
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req, @Res() reply: FastifyReply) {
    const user = await this.authService.login(req.user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.authService.generateJwt(user);

    return reply
      .setCookie('access_token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      .send({ success: true });
  }

  @Post('impersonate/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Se connecter en tant qu'un autre utilisateur (super admin)" })
  async impersonate(
    @Param('userId') userId: string,
    @Res() reply: FastifyReply,
  ) {
    const user = await this.authService.impersonate(userId);
    const token = this.authService.generateJwt(user);

    return reply
      .setCookie('access_token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      .send({ success: true });
  }

  @Post('logout')
  logout(@Res() reply: FastifyReply) {
    return reply
      .clearCookie('access_token', {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      .send({ success: true });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);

    return {
      success: true,
      message:
        'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.',
    };
  }

  @Get('reset-password/validate')
  async validateResetPasswordToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token requis');
    }

    await this.authService.validatePasswordResetToken(token);
    return { valid: true };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);

    return {
      success: true,
      message: 'Votre mot de passe a ete reinitialise avec succes.',
    };
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────
  @Get('google')
  async googleLogin(@Req() req, @Res() reply) {
    const fastify = (req as any).server;

    const url = await fastify.googleOAuth2.generateAuthorizationUri(req, reply);

    return reply.code(302).header('Location', url).send();
  }

  @Get('google/callback')
  async callback(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const fastify = (req as any).server;

    const tokenGoogle =
      await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
        req,
        reply,
      );

    const accessToken = tokenGoogle.token.access_token;

    const googleUser = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ).then((r) => r.json());

    const user = await this.authService.findOrCreateOAuthUser({
      provider: 'google',
      providerAccountId: googleUser.id,
      email: googleUser.email,
      firstname: googleUser.given_name,
      lastname: googleUser.family_name,
      image: googleUser.picture,
    });

    const token = this.authService.generateJwt(user);

    return reply
      .setCookie('access_token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      .code(302)
      .header('Location', `${process.env.FRONTEND_URL}/dashboard`)
      .send();
  }

  // ─── Me ──────────────────────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retourne l'utilisateur connecté" })
  me(@CurrentUser() user: User) {
    return user;
  }
}
