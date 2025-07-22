

import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateVisitorDto } from './create-visitor.dto';
import { VisitorService } from './visitor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('visitors')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() dto: CreateVisitorDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.visitorService.register(dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  list() {
    return this.visitorService.list();
  }
}
