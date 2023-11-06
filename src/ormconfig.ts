import { config } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT as unknown as number,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname + '/../**/*.entity{.ts,.js}')],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: true,
  logging: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
    charset: 'utf8mb4_unicode_ci',
  },
};



export default dbConfig;
