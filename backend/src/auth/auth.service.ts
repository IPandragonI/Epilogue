import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service';
import { ForgotPasswordDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../modules/users/entities/userRole.enum';
import { AccountsService } from '../modules/accounts/accounts.controller';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailService } from '../modules/mail/mail.service';
import { ConfigService } from '@nestjs/config';

export interface OAuthUserPayload {
  provider: string;
  providerAccountId: string;
  email: string;
  firstname: string;
  lastname: string;
  image?: string | null;
  access_token?: string;
  refresh_token?: string | null;
  expires_at?: number | null;
  token_type?: string;
  scope?: string;
  id_token?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private accountsService: AccountsService,
    private jwtService: JwtService,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Email / Password ────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.usersService
      .findByEmail(dto.email)
      .catch(() => null);

    if (existing) {
      throw new BadRequestException('Un compte existe déjà avec cet email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      password: passwordHash,
      role: UserRole.PUBLIC,
    });

    return user;
  }

  async validateLocalUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByEmail(email).catch(() => null);
    if (!user || !user.password) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async login(user: User): Promise<User> {
    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email).catch(() => null);

    if (!user) {
      return;
    }

    await this.passwordResetTokenRepository.delete({ userId: user.id });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresInMinutes = Number(
      this.configService.get<string>('PASSWORD_RESET_TOKEN_TTL_MINUTES') ?? '60',
    );

    await this.passwordResetTokenRepository.save({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await this.mailService.sendPasswordResetEmail({
      to: user.email,
      firstname: user.firstname,
      resetUrl,
      expiresInMinutes,
    });
  }

  async validatePasswordResetToken(token: string): Promise<void> {
    await this.getValidPasswordResetToken(token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const resetToken = await this.getValidPasswordResetToken(dto.token);

    await this.usersService.update(resetToken.userId, { password: dto.password });
    await this.passwordResetTokenRepository.delete({ userId: resetToken.userId });
  }

  // ─── OAuth ───────────────────────────────────────────────────────────────────

  async findOrCreateOAuthUser(payload: OAuthUserPayload): Promise<User> {
    // 1. Cherche si un compte OAuth existe déjà pour ce provider
    const existingAccount = await this.accountsService.findByProvider(
      payload.provider,
      payload.providerAccountId,
    );

    if (existingAccount) {
      // Met à jour les tokens et renvoie le user lié
      await this.accountsService.upsert({
        userId: existingAccount.userId,
        ...payload,
      });
      return this.usersService.findOne(existingAccount.userId);
    }

    // 2. Cherche si un user existe déjà avec cet email (connexion classique)
    let user = await this.usersService
      .findByEmail(payload.email)
      .catch(() => null);

    // 3. Sinon crée le user
    if (!user) {
      user = await this.usersService.create({
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        password: null, // pas de mot de passe pour un user OAuth-only
        role: UserRole.PUBLIC,
      });
    }

    // 4. Crée le compte OAuth lié
    await this.accountsService.upsert({
      userId: user.id,
      provider: payload.provider,
      providerAccountId: payload.providerAccountId,
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      expires_at: payload.expires_at,
      token_type: payload.token_type,
      scope: payload.scope,
      id_token: payload.id_token,
    });

    return user;
  }

  // ─── JWT ─────────────────────────────────────────────────────────────────────
  generateJwt(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname,
    });
  }

  private async getValidPasswordResetToken(
    token: string,
  ): Promise<PasswordResetToken> {
    const tokenHash = hashResetToken(token);
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'Le lien de reinitialisation est invalide ou expire.',
      );
    }

    return resetToken;
  }
}

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
