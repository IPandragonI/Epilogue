import {ConfigService} from "@nestjs/config";
import {TypeOrmModuleOptions} from "@nestjs/typeorm";

export const buildTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost') ?? 'localhost',
    port: configService.get<number>('DB_PORT', 3306) ?? 3306,
    username: configService.get<string>('DB_USER', 'user') ?? 'user',
    password: configService.get<string>('DB_PASSWORD', 'password') ?? 'password',
    database: configService.get<string>('DB_NAME', 'epilogue') ?? 'epilogue',
    autoLoadEntities: true,
    synchronize: true,
    charset: 'utf8mb4',
    // dropSchema: true, // A ENLEVER EN PRODUCTION
})