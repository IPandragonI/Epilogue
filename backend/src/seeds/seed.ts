import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Agency } from '../modules/agency/entities/agency.entity';
import { User } from '../modules/users/entities/user.entity';
import { Topic } from '../modules/topic/entities/topic.entity';
import { ContentIdea } from '../modules/content-idea/entities/content-idea.entity';
import { Content } from '../modules/content/entities/content.entity';
import { UserRole } from '../modules/users/entities/userRole.enum';
import { ContentStatusEnum } from '../modules/content/entities/contentStatus.enum';
import { ContentSeo } from '../modules/content-seo/entities/content-seo.entity';
import { ContentNotion } from '../modules/content-notion/entities/content-notion.entity';
import { PlatformEnum } from '../modules/content-idea/entities/platform.enum';
import { CurationSource } from '../modules/curation-source/entities/curation-source.entity';
import { CurationItem } from '../modules/curation-item/entities/curation-item.entity';
import { CloudSpaceModule } from '../modules/cloud-space/cloud-space.module';
import { CloudSpace } from '../modules/cloud-space/entities/cloud-space.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log('\n=== 🌱 Starting Database Seeding ===\n');

  const dataSource = app.get(DataSource);

  // Repositories
  const agencyRepo = dataSource.getRepository(Agency);
  const userRepo = dataSource.getRepository(User);
  const topicRepo = dataSource.getRepository(Topic);
  const contentIdeaRepo = dataSource.getRepository(ContentIdea);
  const contentRepo = dataSource.getRepository(Content);
  const contentSeoRepo = dataSource.getRepository(ContentSeo);
  const contentNotionRepo = dataSource.getRepository(ContentNotion);
  const curationSourceRepo = dataSource.getRepository(CurationSource);
  const curationItemRepo = dataSource.getRepository(CurationItem);
  const cloudSpaceRepo = dataSource.getRepository(CloudSpace);

  // Clean existing data (optional, be careful in prod)
  // Delete child tables first to avoid FK constraint errors
  await dataSource.createQueryBuilder().delete().from(CurationItem).execute();
  await dataSource.createQueryBuilder().delete().from(CurationSource).execute();
  await dataSource.createQueryBuilder().delete().from(ContentSeo).execute();
  await dataSource.createQueryBuilder().delete().from(ContentNotion).execute();
  await dataSource.createQueryBuilder().delete().from(ContentIdea).execute();
  await dataSource.createQueryBuilder().delete().from(Content).execute();
  await dataSource.createQueryBuilder().delete().from(Topic).execute();
  // Users should be deleted after entities that reference them (e.g. curation_items)
  await dataSource.createQueryBuilder().delete().from(User).execute();
  await dataSource.createQueryBuilder().delete().from(Agency).execute();
  // CloudSpace last
  await dataSource.createQueryBuilder().delete().from(CloudSpace).execute();

  // Agencies
  const agency1 = agencyRepo.create({ name: 'Default Agency' });
  await agencyRepo.save(agency1);

  console.log('=== ✅ Agencies seeded ===');
  // Users
  const pw = await bcrypt.hash('password', 10);
  const admin = userRepo.create({
    firstname: 'Admin',
    lastname: 'User',
    email: 'admin@example.com',
    password: pw,
    role: UserRole.ADMIN,
    cloudSpace: cloudSpaceRepo.create({
      notionToken: 'notion-token',
    }),
  });
  const user = userRepo.create({
    firstname: 'John',
    lastname: 'Doe',
    email: 'user@example.com',
    password: pw,
    role: UserRole.PUBLIC,
    cloudSpace: cloudSpaceRepo.create({
      notionToken: 'notion-token',
    }),
  });
  await userRepo.save([admin, user]);

  console.log('=== ✅ Users seeded ===');
  // Topics
  const t1 = topicRepo.create({ name: 'Marketing' });
  const t2 = topicRepo.create({ name: 'Tech' });
  await topicRepo.save([t1, t2]);

  console.log('=== ✅ Topics ===');

  // Content Ideas
  const idea1 = contentIdeaRepo.create({
    title: 'Improve SEO',
    description: 'Ways to improve SEO',
    topic: t1,
    platform: PlatformEnum.BLOG,
  });
  const idea2 = contentIdeaRepo.create({
    title: 'New Feature',
    description: 'Describe new feature ideas',
    topic: t2,
    platform: PlatformEnum.LINKEDIN,
  });
  await contentIdeaRepo.save([idea1, idea2]);

  console.log('=== ✅ Content seeded ===');
  // Contents
  const c1 = contentRepo.create({
    title: 'First post',
    body: 'Hello world',
    contentPlatform: PlatformEnum.BLOG,
    status: ContentStatusEnum.DRAFT,
    publishedDate: new Date(),
  });
  const c2 = contentRepo.create({
    title: 'Second post',
    body: 'More content',
    contentPlatform: PlatformEnum.LINKEDIN,
    status: ContentStatusEnum.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedDate: new Date(),
  });
  await contentRepo.save([c1, c2]);

  console.log('=== ✅ Content seeded ===');

  const c1seo = contentSeoRepo.create({
    score: 85,
    keywords: 'SEO, marketing, content',
    review: 'Good SEO score, but can be improved with more keywords.',
    content: c1,
  });
  const c2seo = contentSeoRepo.create({
    score: 10,
    keywords: 'SEO, marketing, content',
    review: 'Good SEO score, but can be improved with more keywords.',
    content: c2,
  });
  await contentSeoRepo.save([c1seo, c2seo]);

  const curationSource1 = curationSourceRepo.create({
    name: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    sourceType: 'RSS',
  });
  const curationSource2 = curationSourceRepo.create({
    name: 'FRESH NEWS',
    sourceUrl: 'https://techcrunch.com',
    sourceType: 'PDF',
  });

  await curationSourceRepo.save([curationSource1, curationSource2]);

  const curationItem1 = curationItemRepo.create({
    title: 'TechCrunch Article 1',
    summary: 'Summary of TechCrunch Article 1',
    source: curationSource1,
    user: user,
  });

  const curationItem2 = curationItemRepo.create({
    title: 'Fresh News Article 2',
    summary: 'Summary of Fresh News Article 2',
    source: curationSource2,
    user: admin,
  });

  await curationItemRepo.save([curationItem1, curationItem2]);

  console.log('\n=== ✅ Seeding completed successfully ===\n');

  await app.close();
}

seed()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  });
