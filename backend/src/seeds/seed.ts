import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';

import { Agency } from '../modules/agency/entities/agency.entity';
import { User } from '../modules/users/entities/user.entity';
import { Topic } from '../modules/topic/entities/topic.entity';
import { Content } from '../modules/content/entities/content.entity';
import { ContentSeo } from '../modules/content-seo/entities/content-seo.entity';
import { ContentIdea } from '../modules/content-idea/entities/content-idea.entity';
import { CurationSource } from '../modules/curation-source/entities/curation-source.entity';
import { CurationItem } from '../modules/curation-item/entities/curation-item.entity';
import { CloudSpace } from '../modules/cloud-space/entities/cloud-space.entity';
import { SubscriptionPlan } from '../modules/subscription-plan/entities/subscription-plan.entity';
import { AgencySubscription } from '../modules/agency-subscription/entities/agency-subscription.entity';

import { agencyData } from './data/agency.data';
import { topicData } from './data/topic.data';
import { userData } from './data/user.data';
import { contentData } from './data/content.data';
import { curationData } from './data/curation.data';
import { subscriptionPlanData } from './data/subscription-plan.data';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('\n=== 🌱 Starting Modular Seeding ===\n');

  try {
    console.log('🗑️  Cleaning Database');
    const entities = [
      CurationItem,
      CurationSource,
      ContentSeo,
      ContentIdea,
      Content,
      Topic,
      User,
      Agency,
      CloudSpace,
      SubscriptionPlan,
      AgencySubscription,
    ];
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity);
      await repository.createQueryBuilder().delete().from(entity).execute();
    }
    console.log('✨ Database cleaned');

    const agencyRepo = dataSource.getRepository(Agency);
    const agencies = await agencyRepo.save(agencyRepo.create(agencyData()));
    console.log('✅ Agencies seeded');

    const userRepo = dataSource.getRepository(User);
    const pw = await bcrypt.hash('password', 10);
    const users = await userRepo.save(userRepo.create(userData(pw)));
    console.log('✅ Users seeded');

    const topicRepo = dataSource.getRepository(Topic);
    await topicRepo.save(topicRepo.create(topicData()));
    console.log('✅ Topics seeded');

    const contentRepo = dataSource.getRepository(Content);
    await contentRepo.save(contentRepo.create(contentData()));
    console.log('✅ Contents & SEO seeded');

    const curationSourceRepo = dataSource.getRepository(CurationSource);
    const source = await curationSourceRepo.save(
      curationSourceRepo.create(curationData()),
    );

    const curationItemRepo = dataSource.getRepository(CurationItem);
    await curationItemRepo.save({
      title: 'Modular Seed Article',
      summary: 'Testing modular seeding',
      source: source[0],
      user: users[0],
    });
    console.log('✅ Curation seeded');

    const subscriptionPlanRepo = dataSource.getRepository(SubscriptionPlan);
    const subPlans = await subscriptionPlanRepo.save(
      subscriptionPlanRepo.create(subscriptionPlanData()),
    );
    console.log('✅ Subscription Plans seeded');

    const agencySubscriptionRepo = dataSource.getRepository(AgencySubscription);
    let subs: Partial<AgencySubscription>[] = [];
    for (const agency of agencies) {
      const planId = String(Math.floor(Math.random() * subPlans.length) + 1);
      subs.push({
        agencyId: agency.id,
        subscriptionPlanId: planId,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      });
    }
    await agencySubscriptionRepo.save(subs);
    console.log('✅ Agency Subscriptions seeded');

    console.log('\n=== 🏆 Seeding completed successfully ===\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

seed();
