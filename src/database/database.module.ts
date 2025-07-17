import { Global, Module } from '@nestjs/common';
import * as oracledb from 'oracledb';
import * as dotenv from 'dotenv';

dotenv.config();

@Global()
@Module({
  providers: [
    {
      provide: 'ORACLE_POOL',
      useFactory: async () => {
        const pool = await oracledb.createPool({
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          connectString: process.env.DB_CONNECT_STRING,
          poolMin: 1,
          poolMax: 5,
          poolIncrement: 1,
        });

        return pool; 
      },
    },
  ],
  exports: ['ORACLE_POOL'],
})
export class DatabaseModule {}
