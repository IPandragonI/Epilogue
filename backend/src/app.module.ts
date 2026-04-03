import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmConfig } from '../config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { UsersModule } from './modules/users/users.module';
import { ContentIdeaModule } from './modules/content-idea/content-idea.module';
import { AgencyModule } from './modules/agency/agency.module';
import { TopicModule } from './modules/topic/topic.module';
import { ContentModule } from './modules/content/content.module';
import { CurationItemModule } from './modules/curation-item/curation-item.module';
import { CurationSourceModule } from './modules/curation-source/curation-source.module';
import { ContentNotionModule } from './modules/content-notion/content-notion.module';
import { ContentSeoModule } from './modules/content-seo/content-seo.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildTypeOrmConfig(configService),
    }),
    AuthModule,
    UsersModule,
    AiModule,
    AuthModule,
    ContentIdeaModule,
    AgencyModule,
    TopicModule,
    ContentModule,
    CurationSourceModule,
    CurationItemModule,
    ContentNotionModule,
    ContentSeoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
