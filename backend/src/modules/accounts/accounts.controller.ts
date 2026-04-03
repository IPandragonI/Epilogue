import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

export interface OAuthAccountPayload {
  userId: string;
  provider: string;
  providerAccountId: string;
  access_token?: string;
  refresh_token?: string | null;
  expires_at?: number | null;
  token_type?: string;
  scope?: string;
  id_token?: string | null;
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  /**
   * Crée ou met à jour un compte OAuth.
   * Appelé à chaque connexion OAuth pour rafraîchir les tokens.
   */
  async upsert(payload: OAuthAccountPayload): Promise<Account> {
    const existing = await this.accountRepository.findOneBy({
      provider: payload.provider,
      providerAccountId: payload.providerAccountId,
    });

    if (existing) {
      existing.access_token = payload.access_token ?? existing.access_token;
      existing.refresh_token = payload.refresh_token ?? existing.refresh_token;
      existing.expires_at = payload.expires_at ?? existing.expires_at;
      existing.token_type = payload.token_type ?? existing.token_type;
      existing.scope = payload.scope ?? existing.scope;
      existing.id_token = payload.id_token ?? existing.id_token;

      return this.accountRepository.save(existing);
    }

    const account = this.accountRepository.create(payload);
    return this.accountRepository.save(account);
  }

  findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<Account | null> {
    return this.accountRepository.findOneBy({ provider, providerAccountId });
  }

  findAllByUser(userId: string): Promise<Account[]> {
    return this.accountRepository.findBy({ userId });
  }

  async remove(id: string): Promise<void> {
    await this.accountRepository.delete(id);
  }
}
