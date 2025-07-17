import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { VisitorsModule } from './visitors/visitors.module';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [DatabaseModule, VisitorsModule, AuthModule],
})
export class AppModule {}

