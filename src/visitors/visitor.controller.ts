import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateVisitorDto } from './create-visitor.dto';
import { VisitorService } from './visitor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('visitors')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateVisitorDto) {
    return this.visitorService.register(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  list() {
    return this.visitorService.list();
  }
}
