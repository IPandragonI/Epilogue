import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AccountsService } from './accounts.controller';
import { RegisterDto } from '../../auth/dto/auth.dto';
import { UserRole } from '../users/entities/userRole.enum';
import { User } from '../users/entities/user.entity';

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
  ) {}

  // ─── Email / Password ────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
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

    return this.generateJwt(user);
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

  async login(user: User): Promise<{ access_token: string }> {
    return this.generateJwt(user);
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
        provider: payload.provider,
        providerAccountId: payload.providerAccountId,
        access_token: payload.access_token,
        refresh_token: payload.refresh_token ?? undefined,
        expires_at: payload.expires_at ?? undefined,
        token_type: payload.token_type,
        scope: payload.scope,
        id_token: payload.id_token ?? undefined,
      });
      const user = await this.usersService.findOne(existingAccount.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
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
        password: null,
        role: UserRole.PUBLIC,
      });
    }

    // 4. Crée le compte OAuth lié
    await this.accountsService.upsert({
      userId: user.id,
      provider: payload.provider,
      providerAccountId: payload.providerAccountId,
      access_token: payload.access_token,
      refresh_token: payload.refresh_token ?? undefined,
      expires_at: payload.expires_at ?? undefined,
      token_type: payload.token_type,
      scope: payload.scope,
      id_token: payload.id_token ?? undefined,
    });

    return user;
  }

  // ─── JWT ─────────────────────────────────────────────────────────────────────

  generateJwt(user: User): { access_token: string } {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
