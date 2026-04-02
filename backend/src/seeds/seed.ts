import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log('\n=== 🌱 Starting Database Seeding ===\n');

  //TODO

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
