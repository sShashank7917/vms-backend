import { Module } from '@nestjs/common';
import { VisitorController } from './visitor.controller';
import { VisitorService } from './visitor.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], 
  controllers: [VisitorController],
  providers: [VisitorService],
})
export class VisitorsModule {}
